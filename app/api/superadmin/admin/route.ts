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
    const collection = database.collection('AdminsignupRequests');

    // Fetch the data from the collection
    const data = await collection.find({}, { projection: { username: 1, email: 1, university: 1, status: 1 } }).toArray();

    // Capitalize the first letter of the university field
    const formattedData = data.map(doc => ({
      ...doc,
      university: doc.university.charAt(0).toUpperCase() + doc.university.slice(1)
    }));

    // Return the formatted data as JSON
    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    // Close the MongoDB connection
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
