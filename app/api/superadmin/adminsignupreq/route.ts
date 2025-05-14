import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const runtime = "nodejs"
export async function GET(req: NextRequest) {
  try {
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('AdminsignupRequests');

    const requests = await collection.find({ status: 'pending' }).toArray();
    return NextResponse.json(requests, { status: 200 });
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
      'Allow': 'GET, OPTIONS',
      'Content-Length': '0',
    },
  });
}
