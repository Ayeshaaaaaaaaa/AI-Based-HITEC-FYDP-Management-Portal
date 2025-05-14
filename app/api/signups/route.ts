import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import mailjet from 'node-mailjet';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const POST = async (req) => {
  try {
    const data = await req.json();
    console.log('Incoming request data:', data);

    

    // Hash the password for other userTypes
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate a unique verification token
    const verificationToken = Math.random().toString(36).substring(2);

    // Set up Mailjet API client correctly
    const mailjetClient = new mailjet({
      apiKey: process.env.MAILJET_API_KEY,
      apiSecret: process.env.MAILJET_API_SECRET,
    });

    // Send verification email using Mailjet
    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}&email=${encodeURIComponent(data.email)}`;
    const emailResponse = await mailjetClient.post("send", { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_USER, // Sender email address
            Name: "ProjectSphere"
          },
          To: [
            {
              Email: data.email,
              Name: data.username
            }
          ],
          Subject: "Verify your email address",
          TextPart: `Please click the link to verify your email: ${verificationLink}`,
          HTMLPart: `<p>Please click the button below to verify your email:</p>
            <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>`,
          CustomID: "EmailVerification"
        }
      ]
    });

    console.log('Mailjet response:', emailResponse.body);

    // Insert signup request data into MongoDB
    await client.connect();
    const db = client.db('ProjectSphere');

    const signupData: {
      userType: string;
      username: string;
      email: string;
      password: string;
      verificationToken: string;
      createdAt: Date;
      expiresAt: Date;
      emailVerified: boolean;
      dept?: string;
      batch?: string;
      rollNo?: string;
    } = {
      userType: data.userType,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      verificationToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Set expiration to 1 hour
      emailVerified: false,
    };

    // Add batch, rollNo, and dept if userType is not 'faculty'
    if (data.userType !== 'faculty') {
      signupData.dept = data.dept;
      signupData.batch = data.batch;
      signupData.rollNo = data.rollNo;
    }

    await db.collection('signupRequests').insertOne(signupData);

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });
  } catch (error) {
    console.error('Error during signup process:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close(); // Ensure the client is closed
  }
};
