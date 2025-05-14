import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../../lib/mongodb';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const client = await clientPromise;
    const database = client.db('ProjectSphere');
    const usersCollection = database.collection('signupRequests'); 
    console.log('Querying user with email:', email);
    
    // Find the user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid user' }, { status: 401 });
    }

    // Debug: Log the user object
    console.log('User found:', user);

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    

    if (!isPasswordValid) {
      console.log('Invalid password for email:', email);
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, userType: user.userType, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '12h' });

    // Set token in cookies with security attributes
    const response = NextResponse.json({ 
      message: 'Login successful', 
      userType: user.userType, // Include userType in the response
      email: user.email
    });
    response.cookies.set('token', token, { path: '/', maxAge: 43200 });

    // Return success message with userType
    return response;

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
