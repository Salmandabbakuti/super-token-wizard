import { NextResponse, NextRequest } from 'next/server';

export function GET(req) {
  return NextResponse.json({ message: 'Hello from API route! GET' });
}

export function POST(req) {
  return NextResponse.json({ message: 'Hello from API route! POST' });
}