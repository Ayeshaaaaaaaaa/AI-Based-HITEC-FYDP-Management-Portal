// src/app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../../lib/mongodb';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const client = await clientPromise;
    const database = client.db('ProjectSphere');
    const usersCollection = database.collection('SuperAdmin');
    console.log('Querying user with email:', email);

    // Find the user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid user' }, { status: 401 });
    }


     // Check the password
     const isPasswordValid = await bcrypt.compare(password, user.password);
     if (password!=user.password) {
       console.log('No user found with email:', password,user.password);
       return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
     }

    // Generate JWT token with email, username, and university
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '12h' }
    );

    // Set token in cookies with security attributes
    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('token', token, { path: '/', maxAge: 43200 });

    // Return success message
    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
