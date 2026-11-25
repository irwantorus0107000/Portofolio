import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { authorizeMutation } from '@/lib/admin-auth.mjs';
import { isValidContentFilename } from '@/lib/content-filename.mjs';

export async function GET() {
  const dirPath = path.join(process.cwd(), 'content', 'sertifikat');
  
  if (!fs.existsSync(dirPath)) {
    return NextResponse.json([]);
  }
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  
  const items = files.map(filename => {
    const filePath = path.join(dirPath, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    return { ...data, slug: filename.replace('.md', ''), filename };
  });
  
  return NextResponse.json(items);
}

export async function POST(request) {
  const denied = authorizeMutation(request);
  if (denied) return denied;
  const body = await request.json();
  const { nama, gambar, tahun_terbit, filename } = body;
  if (filename !== undefined && !isValidContentFilename(filename)) {
    return NextResponse.json({ error: 'Nama file tidak valid.' }, { status: 400 });
  }
  
  const content = matter.stringify(`\n# ${nama}\n\nDiterbitkan: ${tahun_terbit || ''}\n`, { nama, gambar, tahun_terbit });

  const dirPath = path.join(process.cwd(), 'content', 'sertifikat');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const newFilename = filename || `sertifikat-${Date.now()}.md`;
  const filePath = path.join(dirPath, newFilename);
  fs.writeFileSync(filePath, content);
  
  return NextResponse.json({ success: true, message: 'Sertifikat berhasil disimpan!' });
}

export async function DELETE(request) {
  const denied = authorizeMutation(request);
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  if (!isValidContentFilename(filename)) {
    return NextResponse.json({ error: 'Nama file tidak valid.' }, { status: 400 });
  }
  
  const filePath = path.join(process.cwd(), 'content', 'sertifikat', filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true, message: 'Sertifikat berhasil dihapus!' });
  }
  
  return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
}