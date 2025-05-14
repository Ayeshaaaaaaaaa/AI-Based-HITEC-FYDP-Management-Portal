import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema, Document } from 'mongoose';
import jwt from 'jsonwebtoken';

export const runtime = "nodejs";
const uri = process.env.MONGODB_URI;

// Interfaces for TypeScript
interface Group extends Document {
  groupCode: string;
  groupLeaderEmail: string;
  memberEmails: string[];
  fypID: string;
  createdAt: Date;
}

// Group schema
const groupSchema = new Schema<Group>({
  groupCode: { type: String, required: true, unique: true },
  groupLeaderEmail: { type: String, required: true },
  memberEmails: { type: [String], default: [] },
  fypID: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '1y' },
});

const GroupModel = mongoose.models.Group || mongoose.model<Group>('Group', groupSchema);

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

// Ensure MongoDB connection is established
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log("Connected to MongoDB successfully.");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw new Error("Database connection error.");
    }
  }
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  let memberEmail: string | undefined;

  // Extract JWT token from cookies
  const token = req.cookies.get('token')?.value;
  if (token) {
    try {
      const decoded: any = await verifyToken(token);
      memberEmail = decoded.email;
    } catch (error) {
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ message: 'Authorization token is required.' }, { status: 401 });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    if (!memberEmail) {
      return NextResponse.json({ message: 'Member email is required.' }, { status: 400 });
    }

    const { groupCode } = await req.json();

    // Check if the user is already a leader or member of any group
    const existingMembership = await GroupModel.findOne({
      $or: [
        { groupLeaderEmail: memberEmail },
        { memberEmails: memberEmail }
      ]
    });
    if (existingMembership) {
      return NextResponse.json({ message: 'You are already a member or leader of another group.' }, { status: 409 });
    }

    // Find the group by code
    const group = await GroupModel.findOne({ groupCode });
    if (!group) {
      return NextResponse.json({ message: 'Group not found. Please check the group code.' }, { status: 404 });
    }

    // Check if the user is already in the target group as a member or leader
    if (group.groupLeaderEmail === memberEmail || group.memberEmails.includes(memberEmail)) {
      return NextResponse.json({ message: 'You are already a member or leader of this group.' }, { status: 409 });
    }

    // Check if the group already has three members (1 leader + 2 members)
    const totalMembers = 1 + group.memberEmails.length;
    if (totalMembers >= 3) {
      return NextResponse.json({ message: 'Group already has the maximum allowed members.' }, { status: 400 });
    }

    // Add the member to the group
    group.memberEmails.push(memberEmail);
    await group.save();

    return NextResponse.json({ message: 'Successfully joined the group!' }, { status: 200 });
  } catch (error) {
    console.error("Error joining FYP group:", error);
    return NextResponse.json({ message: 'Failed to join group.' }, { status: 500 });
  }
};
