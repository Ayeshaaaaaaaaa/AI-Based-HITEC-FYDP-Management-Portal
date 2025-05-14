import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const runtime = "nodejs"
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userType, username, email, password,dept,batch,rollNo } = body;

    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('signupRequests');

    await collection.insertOne({
      userType,
      username,
      email,
      password,
      dept,
      batch,
      rollNo,
      status: 'pending', // status for admin approval
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Sign-up request sent for approval To FYP incharge!' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Allow': 'POST, OPTIONS',
      'Content-Length': '0',
    },
  });
}
