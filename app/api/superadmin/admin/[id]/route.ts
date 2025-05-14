import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const tokenCookie = req.cookies.get('token');
  
  if (!tokenCookie) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const token = tokenCookie.value; // Extract the token value

  try {
    const decoded: any = await verifyToken(token);
    const { id } = params;
    const { status } = await req.json();
    const client = await clientPromise;
    const database = client.db('ProjectSphere');
    const collection = database.collection('AdminsignupRequests');

    const admin = await collection.findOne({ _id: new ObjectId(id) });

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    if (admin.status === 'pending' || admin.status === 'rejected') {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      return NextResponse.json({ message: 'Status updated successfully!' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Cannot update status of approved admins' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error during update:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const tokenCookie = req.cookies.get('token');
  
  if (!tokenCookie) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const token = tokenCookie.value; // Extract the token value

  try {
    const decoded: any = await verifyToken(token);
    const { id } = params;

    const client = await clientPromise;
    const database = client.db('ProjectSphere');
    const collection = database.collection('AdminsignupRequests');

    const admin = await collection.findOne({ _id: new ObjectId(id) });

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    if (admin.status === 'approved') {
      await collection.deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ message: 'Admin deleted successfully!' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Cannot delete pending or rejected admins' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error during delete:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
