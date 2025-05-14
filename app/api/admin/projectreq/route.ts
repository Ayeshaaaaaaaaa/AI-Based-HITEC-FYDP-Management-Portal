import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = await verifyToken(token);

    if (!decoded || !decoded.university) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token content' }, { status: 401 });
    }

    const adminUniversity = String(decoded.university).trim();

    await client.connect();
    const database = client.db('ProjectSphere');
    const projectsCollection = database.collection('Projects');
    const studentsCollection = database.collection('signupRequests'); 
     
    // Fetch the list of student IDs or emails from the same university
    const students = await studentsCollection.find({
      university: adminUniversity.toLowerCase().trim()
    }).toArray();

    const studentEmails = students.map(student => student.email.toLowerCase()); // Or student IDs if that’s what you use

    // Fetch projects requested by students from the same university
    const projects = await projectsCollection.find({
      status: 'pending',
      requestedBy: { $in: studentEmails }
    }).toArray();

    return NextResponse.json(projects, { status: 200 });

  } catch (error) {
    console.error('Error during fetch:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Allow': 'GET, OPTIONS',
      'Content-Length': '0',
    },
  });
}

// Mock implementation of verifyToken function
// Replace with actual implementation
function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
