import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { department } = body;

    if (!department) {
      return NextResponse.json({ message: 'Department is required.' }, { status: 400 });
    }

    await client.connect();
    const database = client.db('ProjectSphere');
    const supervisorsCollection = database.collection('supervisors');

    // Query to find supervisors by department
    const supervisors = await supervisorsCollection
      .find({ department: department })
      .project({ _id: 0, name: 1, email: 1, department: 1, specialization: 1 })
      .toArray();

    if (supervisors.length === 0) {
      return NextResponse.json({ message: 'No supervisors found for the specified department.' }, { status: 404 });
    }

    return NextResponse.json({ supervisors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching supervisors:', error);
    return NextResponse.json({ message: 'Failed to fetch supervisors.' }, { status: 500 });
  } finally {
    await client.close();
  }
}
