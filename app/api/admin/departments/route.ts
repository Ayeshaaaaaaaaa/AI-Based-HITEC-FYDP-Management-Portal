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
    const collection = database.collection('departments');

    const adminUniversity = decoded.university.toLowerCase();

    const departments = await collection.aggregate([
      {
        $project: {
          university: { $toLower: "$university" },
          name: 1,
          imageUrl: 1,
          description: 1,
          link: 1,
        }
      },
      {
        $match: {
          university: adminUniversity,
        }
      }
    ]).toArray();
    
    console.log('Query Result:', departments);
    return NextResponse.json(departments);

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid Token:', error.message);
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    
    console.error('Error during fetch:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
