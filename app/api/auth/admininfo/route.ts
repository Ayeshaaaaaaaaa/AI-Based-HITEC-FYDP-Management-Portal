// src/app/api/auth/admininfo/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '../../../../lib/mongodb'; 
import { ObjectId } from 'mongodb'; // Ensure you import ObjectId

export async function GET(request) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

        // Decode the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded Token:', decoded); // Debugging line
        } catch (e) {
            console.log('Token verification failed:', e);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Connect to the database
        const client = await clientPromise;
        const database = client.db('ProjectSphere');
        const adminCollection = database.collection('AdminsignupRequests');

        // Fetch the admin data
        // Ensure that decoded.id is converted to ObjectId if needed
        const adminId = new ObjectId(decoded.id); // Convert ID to ObjectId
        console.log('Querying admin with ID:', adminId); // Debugging line

        const admin = await adminCollection.findOne({ _id: adminId });

        if (!admin) {
            console.log('Admin not found with ID:', adminId); // Debugging line
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        // Return the admin data
        console.log('Fetched Admin:', admin); // Debugging line
        return NextResponse.json({ username: admin.username, email: admin.email , university: admin.university});
    } catch (error) {
        console.error('Error:', error); // Detailed error logging
        return NextResponse.json({ error: 'Error fetching admin info' }, { status: 500 });
    }
}
