import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const runtime = "nodejs"
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const projectName = formData.get('projectName')?.toString();
    const universityName = formData.get('universityName')?.toString();
    const departmentName = formData.get('departmentName')?.toString();
    const supervisorName = formData.get('supervisorName')?.toString();
    const file = formData.get('file');
    const submittedBy = formData.get('submittedBy')?.toString();

    if (!projectName || !universityName || !departmentName || !supervisorName || !file || !submittedBy) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('Projects');
    
    await collection.insertOne({
      projectName,
      universityName,
      departmentName,
      supervisorName,
      file,
      submittedBy,
      status: 'pending', // status for admin approval
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Project request sent for approval!' }, { status: 200 });
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
