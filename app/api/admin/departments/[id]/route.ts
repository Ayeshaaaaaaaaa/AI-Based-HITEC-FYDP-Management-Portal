import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
// import path from 'path';
// import formidable from 'formidable';


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
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');
  
  if (!tokenCookie) {
    console.log('No token cookie found');
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }
  
  const token = tokenCookie.value;
  console.log('Token:', token);

  let client; // Declare client variable

  try {
    const decoded: any = await verifyToken(token);

    console.log('Decoded Token:', decoded);

    if (!decoded || !decoded.university) {
      console.log('Token does not contain university');
      return NextResponse.json({ message: 'Unauthorized: Invalid token content' }, { status: 401 });
    }

    // Await the clientPromise to get the MongoDB client
    client = await clientPromise;
    const database = client.db('ProjectSphere');
    const collection = database.collection('departments');

    // Parse JSON request body
    const body = await req.json();
    const { name, description } = body;

    // Construct department object with the university from the decoded token
    const newDepartment = {
      name,
      description,
      university: decoded.university, // Use the university from the token
      imageUrl: '',  // Handle this separately if needed
    };

    // Insert department into the collection
    const result = await collection.insertOne(newDepartment);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid Token:', error.message);
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  } finally {
    // Ensure the client is only closed if it was successfully created
    if (client) {
      await client.close();
    }
  }
}

export async function PUT(req: NextRequest) {
  try {
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('departments');

    const body = await req.json();
    const id = body.id;
    const updateData = { ...body };

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    delete updateData.id;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (result.value) {
      return NextResponse.json(result.value);
    } else {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  } finally {
    await client.close();
  }
}
export async function DELETE(req: NextRequest) {
  try {
    await client.connect();
    const database = client.db('ProjectSphere');
    const collection = database.collection('departments');

    const { id } = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Department deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  } finally {
    await client.close();
  }
}