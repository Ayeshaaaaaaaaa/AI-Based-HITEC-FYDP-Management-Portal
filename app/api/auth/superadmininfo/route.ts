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
        const superadminCollection = database.collection('SuperAdmin');

        // Fetch the admin data
        // Ensure that decoded.id is converted to ObjectId if needed
        const superadminId = new ObjectId(decoded.id); // Convert ID to ObjectId
        console.log('Querying admin with ID:', superadminId); // Debugging line

        const superadmin = await superadminCollection.findOne({ _id: superadminId });

        if (!superadmin) {
            console.log('Admin not found with ID:', superadminId); // Debugging line
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        // Return the admin data
        console.log('Fetched SuperAdmin:', superadmin); // Debugging line
        return NextResponse.json({ username: superadmin.username, email: superadmin.email});
    } catch (error) {
        console.error('Error:', error); // Detailed error logging
        return NextResponse.json({ error: 'Error fetching superadmin info' }, { status: 500 });
    }
}
