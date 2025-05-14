import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

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

export async function GET(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');
  
  if (!tokenCookie) {
    console.log('No token cookie found');
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }
  
  const token = tokenCookie.value;
  console.log('Token:', token);

  try {
    const decoded: any = await verifyToken(token);

    console.log('Decoded Token:', decoded);

    if (!decoded || !decoded.university) {
      console.log('Token does not contain university');
      return NextResponse.json({ message: 'Unauthorized: Invalid token content' }, { status: 401 });
    }

    const client = await clientPromise;
    const database = client.db('ProjectSphere');
    const collection = database.collection('signupRequests');

    const adminUniversity = decoded.university.toLowerCase();

    const students = await collection.aggregate([
      {
        $project: {
          university: { $toLower: "$university" },
          userType: 1,
          username: 1,
          email: 1,
          studentId: 1,
          program: 1,
          status: 1,
        }
      },
      {
        $match: {
          university: adminUniversity,
          userType: 'student'
        }
      }
    ]).toArray();
    
    console.log('Query Result:', students);
    return NextResponse.json(students);

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid Token:', error.message);
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    
    console.error('Error during fetch:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

