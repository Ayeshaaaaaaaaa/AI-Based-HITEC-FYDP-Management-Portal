import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('universities');

    // Fetch universities from the collection
    const universities = await collection.find({}).toArray();

    // Return the universities as a JSON response
    return NextResponse.json(universities);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  } finally {
    await client.close();
  }
}
