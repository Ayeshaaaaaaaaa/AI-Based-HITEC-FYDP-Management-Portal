import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { google } from 'googleapis';

const { OAuth2 } = google.auth;

export const runtime = "nodejs";
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Set up the OAuth2 client
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:3000/api/auth/callback" // Redirect URI for OAuth2
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query; // Get the authorization code from the query params

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing.' });
    }

    // Get tokens using the authorization code
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens); // Set the credentials for future API requests

    // Fetch the user's email using the UserInfo API
    const userInfoClient = google.oauth2('v2').userinfo;
    const userInfoResponse = await userInfoClient.get({ auth: oauth2Client });

    const userEmail = userInfoResponse.data.email; // Get the user's email from the response

    // Connect to MongoDB to store tokens
    await client.connect();
    const db = client.db('ProjectSphere');

    // Store the tokens in your database, here we're assuming you have a user ID or email to associate with
    await db.collection('User').updateOne(
      { email: userEmail }, // Use the fetched email to find the user
      {
        $set: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + (tokens.expiry_date - Date.now()), // Use expiry_date directly
        },
      },
      { upsert: true } // Create the user if not found
    );

    // Redirect to a success page or send a response
    res.redirect('http://localhost:3000/success'); // Change to your success redirect URL
  } catch (error) {
    console.error('Error during OAuth2 callback:', error); // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close(); // Close the database connection
  }
}
