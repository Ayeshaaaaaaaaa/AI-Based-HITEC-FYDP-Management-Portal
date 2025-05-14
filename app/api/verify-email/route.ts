import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

// Named export for the POST method
export async function POST(request: Request) {
  const { token, email } = await request.json(); // Extract token and email from the request body

  // Validate the token and email
  if (!token || !email) {
    return NextResponse.json({ message: 'Invalid request, token or email missing' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('ProjectSphere');
    console.log('Connected to MongoDB');

    // Check if the token and email are valid
    const user = await db.collection('signupRequests').findOne({ email, verificationToken: token });
    

    if (!user) {
      return NextResponse.json({ message: 'Invalid token or email' }, { status: 400 });
    }

    // Prepare the update object
    const updateFields: any = {
      emailVerified: true,
      verificationToken: null // Clear the token
    };

    // If the userType is 'request', set the status to 'pending'
    if (user.userType === 'request') {
      updateFields['status'] = 'pending'; // Create the status field
    }

    // Update the user's status and verification details
    const updateResult = await db.collection('signupRequests').updateOne(
      { email, verificationToken: token },
      { $set: updateFields } // Update with the prepared fields
    );

    //console.log('Update result:', updateResult);

    // Check modifiedCount
    if (updateResult.modifiedCount === 0) {
      console.log('No updates made. Check if values were already set.');
      return NextResponse.json({ message: 'No updates made' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Email verified successfully', 
      userType: user.userType 
    }, { status: 200 });

  } catch (error) {
    console.error('Error during email verification:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
