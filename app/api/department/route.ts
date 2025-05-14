import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  let memberEmail: string | undefined;

  // Extract JWT token from cookies
  const token = req.cookies.get('token')?.value;
  if (token) {
    try {
      const decoded: any = await verifyToken(token);
      memberEmail = decoded.email;
    } catch (error) {
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ message: 'Authorization token is required.' }, { status: 401 });
  }

  try {
    const studentPattern = /^[0-9]{2}-[A-Za-z]{2}-[0-9]{3}@student\.hitecuni\.edu\.pk$/;
    if (!studentPattern.test(memberEmail)) {
      return NextResponse.json({ message: ' email is required.' }, { status: 400 });
    }
    const dept = memberEmail.slice(3, 5); // Extract department

    return NextResponse.json({ deptName: dept }, { status: 200 });
  } catch (error) {
    console.error("Error joining FYP group:", error);
    return NextResponse.json({ message: 'Failed to join group.' }, { status: 500 });
  }
};
