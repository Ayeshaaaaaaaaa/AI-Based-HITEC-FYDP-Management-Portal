import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '../../../../lib/mongodb';

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Extract the token from the cookies
    const token = req.cookies.get('token')?.value;
    if (!token) {
      console.error('No token found in cookies');
      return NextResponse.json({ error: 'No valid token found in cookies' }, { status: 401 });
    }

    // Verify the token and decode it
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Extract the admin's university from the decoded token
    const adminUniversity = String(decoded.university).trim();
    console.log('Decoded Token:', decoded);
    console.log('Admin University:', adminUniversity);

    // Connect to the database
    const client = await clientPromise;
    const database = client.db('ProjectSphere');
    const collection = database.collection('signupRequests');

    // Log the university and status being queried
    console.log('Querying with university:', adminUniversity);
    
    // Fetch signup requests for the admin's university
    const requests = await collection.find({ 
      university: { $regex: new RegExp(`^${adminUniversity}$`, 'i') }, 
      status: 'pending' 
    }).toArray();
    
    // Log the fetched requests
    console.log('Fetched Requests:', requests);

    // Return the fetched requests
    return NextResponse.json(requests, { status: 200 });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
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
