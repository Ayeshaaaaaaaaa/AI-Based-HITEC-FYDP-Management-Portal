// src/app/api/check-email/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Make sure to set your MongoDB URI in environment variables
const client = new MongoClient(uri);

const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
        await client.connect();
        const database = client.db('ProjectSphere'); // Replace with your database name
        const usersCollection = database.collection('signupRequests'); // Replace with your collection name

        const user = await usersCollection.findOne({ email });
        return user !== null; // Return true if user exists
    } catch (error) {
        console.error('Error checking email:', error);
        throw new Error('Database query failed'); // Throw an error to be caught in the handler
    } finally {
        await client.close(); // Ensure the client is closed
    }
};

// Named export for the GET method
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Check if email is provided
    if (!email || typeof email !== 'string') {
        return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    try {
        const exists = await checkEmailExists(email);
        return NextResponse.json({ exists }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
