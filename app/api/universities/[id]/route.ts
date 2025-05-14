import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId if needed for type checking

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(req: NextRequest) {
  try {
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('universities');

    const universities = await collection.find().toArray();
    return NextResponse.json(universities);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, url, logo } = await req.json();

    if (!name || !url || !logo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('universities');

    const newUniversity = { name, url, logo };
    const result = await collection.insertOne(newUniversity);

    return NextResponse.json({ id: result.insertedId, ...newUniversity }, { status: 201 });
  } catch (error) {
    console.error('Error creating university:', error);
    return NextResponse.json({ error: 'Failed to create university' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, url, logo } = await req.json();
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('universities');

    const updatedUniversity = { name, url, logo };
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedUniversity });
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'No university updated' }, { status: 404 });
    }
    return NextResponse.json({ message: 'University updated' });
  } catch (error) {
    console.error('Error updating university:', error);
    return NextResponse.json({ error: 'Failed to update university' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('universities');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'University deleted' });
  } catch (error) {
    console.error('Error deleting university:', error);
    return NextResponse.json({ error: 'Failed to delete university' }, { status: 500 });
  }
}