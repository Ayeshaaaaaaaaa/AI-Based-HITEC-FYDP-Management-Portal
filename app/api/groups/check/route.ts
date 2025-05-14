import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema, Document } from 'mongoose';

export const runtime = 'nodejs';
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

// Database connection helper
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('Connected to MongoDB successfully.');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw new Error('Database connection error.');
    }
  }
};

// POST handler
export const POST = async (req: NextRequest) => {
  try {
    // Parse the request body
    const { email } = await req.json();

    await connectDB();

    // Find if the email exists as a group leader or member
    const existingMembership = await GroupModel.findOne({
      $or: [
        { groupLeaderEmail: email },
        { memberEmails: email },
      ],
    });

    // Respond with group membership status
    return NextResponse.json({ isGroupMember: !!existingMembership }, { status: 200 });

  } catch (error) {
    console.error('Error checking group membership:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
};
