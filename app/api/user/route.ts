import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

  export const runtime = "nodejs"
export async function GET(req: NextRequest) {
  // Authorization Header Check
  //console.log('Received Headers:', req.headers); 
  const authHeader = req.headers.get('authorization');
  //console.log('Authorization Header:', authHeader); 
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Authorization header missing or invalid' }, { status: 401 });
  }

  // Extract Token
  const token = authHeader.split(' ')[1];

  try {
    // Verify Token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('signupRequests'); // Assuming you have a users collection

    // Convert decoded.id to ObjectId
    const objectId = ObjectId.createFromHexString(decoded.id);
    
    // Fetch User Information
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return User Information
    return NextResponse.json({
      userType: user.userType,
      username: user.username,
      email: user.email,
      university: user.university,
      // Add any other user fields you want to return
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 500 });
  }
}
