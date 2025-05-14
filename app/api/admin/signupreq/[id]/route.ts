import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '../../../../../lib/mongodb';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const runtime = "nodejs"
const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export async function PUT(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split('/').pop();
  console.log('Extracted ID:', id); // Debug log
  if (!id || typeof id !== 'string' || !isValidObjectId(id)) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 });
  }

  const { status } = await req.json();

  try {
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('signupRequests');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }

    );
    if (result.modifiedCount === 1 && status === 'approved') {
      const token = jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      const response = NextResponse.json({ success: true });
      response.headers.set('Set-Cookie', serialize('token', token, {
        path: '/',
        httpOnly: true,
        maxAge: 3600,
      }));

      return response;
    }else {
      return NextResponse.json({ error: 'User not found or already approved' }, { status: 400 });
    }

   

    //return NextResponse.json({ message: 'Request updated successfully!' }, { status: 200 });
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
      'Allow': 'PUT, OPTIONS',
      'Content-Length': '0',
    },
  });
}
