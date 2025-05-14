// src/app/api/logout/route.js

import { NextResponse } from 'next/server';

export async function GET() {
  // Clear the token by setting an expired cookie
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set('token', '', { expires: new Date(0) }); // Expire the token

  return response;
}
