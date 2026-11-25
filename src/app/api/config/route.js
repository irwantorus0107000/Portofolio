import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authorizeMutation } from '@/lib/admin-auth.mjs';

export async function GET() {
  const filePath = path.join(process.cwd(), 'content', 'config.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return NextResponse.json(data);
}

export async function POST(request) {
  const denied = authorizeMutation(request);
  if (denied) return denied;
  const body = await request.json();
  const filePath = path.join(process.cwd(), 'content', 'config.json');
  fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
  return NextResponse.json({ success: true, message: 'Data berhasil disimpan!' });
}