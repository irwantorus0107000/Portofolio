import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const imageTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

export async function GET(_request, { params }) {
  const { filename } = await params;
  const contentType = imageTypes[path.extname(filename).toLowerCase()];
  if (!contentType || path.basename(filename) !== filename) {
    return new NextResponse('File tidak ditemukan', { status: 404 });
  }

  try {
    const file = await readFile(path.join(process.cwd(), 'public', 'images', 'uploads', filename));
    return new NextResponse(file, { headers: { 'Content-Type': contentType, 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return new NextResponse('File tidak ditemukan', { status: 404 });
    }
    console.error('Gagal membaca gambar:', error);
    return new NextResponse('Gagal membaca gambar', { status: 500 });
  }
}
