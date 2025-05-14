import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

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

let cachedClient: MongoClient | null = null;

async function getDatabaseClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient;
}

// New function to check eligibility for a single supervisor
const checkSupervisorEligibility = async (
  supervisorName: string,
  deptName: string,
  projectsphereDb: any
) => {
  const supervisorsCollection = projectsphereDb.collection('supervisors');

  // Check if the supervisor has less than 3 groups
  const supervisor = await supervisorsCollection.findOne({ name: supervisorName, dept: deptName });
  // If supervisor is not found, return ineligible
  if (!supervisor) {
    return { canSendProposal: false, message: 'Supervisor not found' };
  }

  // Check if the groups field exists and has 3 or more groups
  if (supervisor.groups && supervisor.groups.length >= 4) {
    return { canSendProposal: false, message: 'Supervisor cannot accept more groups' };
  }

  return { canSendProposal: true };
};

export const POST = async (req: NextRequest) => {
  try {
    const { supervisors } = await req.json();
    const token = req.cookies.get('token')?.value;

    // Decode the JWT to extract the email
    let userEmail: string | undefined;
    if (token) {
      try {
        const decoded: any = await verifyToken(token);
        userEmail = decoded.email;
      } catch (error) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ message: 'Authorization token is required.' }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json({ message: 'User not authenticated.' }, { status: 401 });
    }

    // Connect to the MongoDB database
    const client = await getDatabaseClient();
    const projectsphereDb = client.db('ProjectSphere');
    const testDb = client.db('test');
    const projectsCollection = testDb.collection('projects');
    const testGroupsCollection = testDb.collection('groups');

    // Run these checks only once
    const existingGroup = await testGroupsCollection.findOne({ groupLeaderEmail: userEmail });

    if (!existingGroup) {
      return NextResponse.json({ canSendProposal: false, message: 'User is not a group leader' }, { status: 403 });
    }

    const { fypID } = existingGroup;
    const existingProject = await projectsCollection.findOne({ fypID });

    if (existingProject) {
      return NextResponse.json({ canSendProposal: false, message: 'Proposal already submitted by this group leader' }, { status: 403 });
    }

    // If the user passes the initial checks, check eligibility for each supervisor
    const eligibilityStatus: { [key: string]: any } = {};
    for (const supervisor of supervisors) {
      const { supervisorName, deptName } = supervisor;
      const result = await checkSupervisorEligibility(supervisorName, deptName, projectsphereDb);
      eligibilityStatus[supervisorName] = result;
    }

    // Return eligibility status for all supervisors
    return NextResponse.json({ supervisorEligibility: eligibilityStatus }, { status: 200 });

  } catch (error) {
    console.error('Error checking supervisor groups:', error);
    return NextResponse.json({ message: 'Failed to check supervisor groups.' }, { status: 500 });
  }
};
