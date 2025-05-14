import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, GridFSBucket } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
};

// Function to verify the JWT token
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

// Use export const POST to handle POST requests
export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authorization token is required.' }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    const email = decoded.email;

    // Connect to the MongoDB database
    await client.connect();
    const database = client.db('test'); // Replace with your database name
    const groupsCollection = database.collection('groups');

    // Extract FYP group number from the groups collection
    const group = await groupsCollection.findOne({
      $or: [
        { groupLeaderEmail: email }, // Check if the user is the group leader
        { memberEmails: email }, // Check if the user is a member
      ],
    });

    if (!group) {
      return NextResponse.json({ message: 'No group found for this user.' }, { status: 404 });
    }

    const fypID = group.fypID; // Adjust the field based on your group structure

    // Use FormData to parse the incoming form data
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const supervisorName = formData.get('supervisorName') as string;
    const dept = formData.get('dept') as string;
    const document = formData.get('document') as File;

    if (!document) {
      return NextResponse.json({ message: 'Document file is missing.' }, { status: 400 });
    }

    // Convert document to Buffer
    const arrayBuffer = await document.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Connect to GridFS to store the document
    const bucket = new GridFSBucket(database);
    const uploadStream = bucket.openUploadStream(document.name);

    // Return a response when the upload completes
    await new Promise<void>((resolve, reject) => {
      uploadStream.write(buffer);
      uploadStream.end();

      uploadStream.on('finish', async () => {
        try {
          // Save project details to the projects collection after the file has been uploaded
          const projectsCollection = database.collection('projects');
          await projectsCollection.insertOne({
            title,
            description,
            documentId: uploadStream.id, // Store the document ID from GridFS
            supervisorName,
            dept,
            fypID,
            status: 'pending',
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      uploadStream.on('error', (error) => {
        reject(error);
      });
    });

    return NextResponse.json({ message: 'Proposal submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error submitting proposal:', error);
    return NextResponse.json({ message: 'Failed to submit proposal.' }, { status: 500 });
  } finally {
    await client.close();
  }
};
