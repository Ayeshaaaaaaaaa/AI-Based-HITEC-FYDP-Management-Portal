import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema, Document } from 'mongoose';
import jwt from 'jsonwebtoken';
import mailjet from 'node-mailjet';

export const runtime = "nodejs";
const uri = process.env.MONGODB_URI;

// Function to verify the JWT token
const verifyToken = (token: string) => {
  return new Promise<any>((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

// Interfaces for TypeScript
interface GroupCounter extends Document {
  year: string;
  counter: number;
}

interface Group extends Document {
  groupCode: string;
  groupLeaderEmail: string;
  memberEmails: string[];
  fypID: string;
  createdAt: Date; // Added for tracking creation time
}

// Counter schema for FYP group IDs
const groupCounterSchema = new Schema<GroupCounter>({
  year: { type: String, required: true, unique: true },
  counter: { type: Number, default: 1 },
});

// Group schema
const groupSchema = new Schema<Group>({
  groupCode: { type: String, required: true, unique: true },
  groupLeaderEmail: { type: String, required: true },
  memberEmails: { type: [String], default: [] },
  fypID: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '1y' }, // Automatically delete after 1 year
});

// Check if models already exist, otherwise define them
const GroupCounterModel = mongoose.models.GroupCounter || mongoose.model<GroupCounter>('GroupCounter', groupCounterSchema);
const GroupModel = mongoose.models.Group || mongoose.model<Group>('Group', groupSchema);

// Ensure MongoDB connection is established
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) { // Only connect if not already connected
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000, // Set a timeout for initial connection
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });
      console.log("Connected to MongoDB successfully.");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw new Error("Database connection error.");
    }
  }
};

// Function to get the FYP group prefix
const getGroupPrefix = (): string => {
  const currentYear = new Date().getFullYear();
  return (currentYear - 3).toString().slice(-2);
};

// Function to generate a unique group code
const generateGroupCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
const mailjetClient = new mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET,
});
// HTML and CSS Template for the Email
const generateEmailTemplate = (groupCode: string) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .email-container { background-color: #ffffff; border-radius: 8px; padding: 20px; max-width: 600px; margin: 0 auto; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1); }
          h2 { color: #333333; text-align: center; }
          .group-code { background-color: #007bff; color: #ffffff; font-size: 20px; font-weight: bold; padding: 10px; text-align: center; border-radius: 5px; margin-top: 20px; }
          p { font-size: 16px; color: #555555; text-align: center; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #aaaaaa; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h2>Your FYP Group Code</h2>
          <p>We are excited to inform you that your FYP group has been created successfully.</p>
          <div class="group-code">${groupCode}</div>
          <p>Use this code to invite other members to your group.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} HITEC University FYP Management Portal
          </div>
        </div>
      </body>
    </html>
  `;
};
// Function to send email using Mailjet
const sendGroupCodeEmail = async (recipientEmail: string, groupCode: string) => {
  const htmlContent = generateEmailTemplate(groupCode);
  await mailjetClient.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_USER, // Replace with your verified sender email
          Name: 'Project Sphere',
        },
        To: [
          {
            Email: recipientEmail,
            Name: 'FYP Group Leader',
          },
        ],
        Subject: 'Your FYP Group Code',
        HTMLPart: htmlContent,
      },
    ],
  });
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  return await createFYPGroup(req);
}

// Function to create a new FYP group
export const createFYPGroup = async (req: NextRequest): Promise<NextResponse> => {
  console.log("Starting to create FYP group...");
  let leaderEmail: string | undefined;

  // Extract JWT token from cookies
  const token = req.cookies.get('token')?.value; // Use `req.cookies.get` to get the token from cookies
  if (token) {
    try {
      const decoded: any = await verifyToken(token);
      console.log('Decoded Token:', decoded);
      leaderEmail = decoded.email;
      console.log('Decoded email:', leaderEmail); // Ensure that the decoded email is logged
    } catch (error) {
      console.error("Failed to decode token:", error);
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }
  } else {
    console.error('Authorization token is missing in cookies.');
    return NextResponse.json({ message: 'Authorization token is required.' }, { status: 401 });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    if (!leaderEmail) {
      console.error("Leader email not provided.");
      return NextResponse.json({ message: 'Leader email is required.' }, { status: 400 });
    }

    // Check if the leader has already created a group
    const existingGroup = await GroupModel.findOne({
      $or: [
        { groupLeaderEmail: leaderEmail }, // Check if the provided email is a leader
        { memberEmails: leaderEmail }       // Check if the provided email is a member
      ]
    });
    if (existingGroup) {
      console.log("The provided email is already a leader or member of a group..");
      return NextResponse.json({ message: 'Group already exists for this email.' }, { status: 409 });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const yearPrefix = getGroupPrefix();

    const counterDoc = await GroupCounterModel.findOneAndUpdate(
      { year: yearPrefix },
      { $inc: { counter: 1 } },
      { new: true, upsert: true, session }
    );

    const fypID = `${yearPrefix}-FYP-${String(counterDoc.counter).padStart(2, '0')}`;
    const groupCode = generateGroupCode();

    const newGroup = new GroupModel({
      groupCode,
      groupLeaderEmail: leaderEmail,
      memberEmails: [],
      fypID,
    });

    await newGroup.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Send Email to Group Leader
    await sendGroupCodeEmail(leaderEmail, groupCode);
    return NextResponse.json({ message: 'Group created successfully!', group: newGroup }, { status: 201 });
  } catch (error) {
    console.error("Error creating FYP group:", error);
    return NextResponse.json({ message: 'Failed to create group.', error: error.message }, { status: 500 });
  }
};
