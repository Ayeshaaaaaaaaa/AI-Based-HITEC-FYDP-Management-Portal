import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      const { status } = await req.json();
  
      await client.connect();
      const database = client.db('ProjectSphere');
      const collection = database.collection('signupRequests');
  
      const faculty = await collection.findOne({ _id: new ObjectId(id) });
  
      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }
  
      if (faculty.status === 'pending' || faculty.status === 'rejected') {
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
        return NextResponse.json({ message: 'Status updated successfully!' }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Cannot update status of approved faculty' }, { status: 400 });
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
      await client.close();
    }
  }
  
  export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
  
      await client.connect();
      const database = client.db('ProjectSphere');
      const collection = database.collection('signupRequests');
  
      const faculty = await collection.findOne({ _id: new ObjectId(id) });
  
      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }
  
      if (faculty.status === 'approved') {
        await collection.deleteOne({ _id: new ObjectId(id) });
        return NextResponse.json({ message: 'Faculty deleted successfully!' }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Cannot delete pending or rejected faculty' }, { status: 400 });
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
      await client.close();
    }
  }
  
