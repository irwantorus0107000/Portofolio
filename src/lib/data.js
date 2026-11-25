import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Fungsi membaca file JSON
export function getConfig() {
  const filePath = path.join(process.cwd(), 'content', 'config.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

// Fungsi membaca semua file markdown dari folder
export function getMarkdownFiles(directory) {
  const dirPath = path.join(process.cwd(), 'content', directory);
  const files = fs.readdirSync(dirPath);
  
  const items = files.map((filename) => {
    const filePath = path.join(dirPath, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    return {
      ...data,
      content,
      slug: filename.replace('.md', '')
    };
  });
  
  return items;
}

// Fungsi spesifik untuk setiap section
export function getPengalaman() {
  return getMarkdownFiles('pengalaman');
}

export function getPendidikan() {
  return getMarkdownFiles('pendidikan');
}

export function getSertifikat() {
  return getMarkdownFiles('sertifikat');
}

export function getProyek() {
  return getMarkdownFiles('proyek');
}

export function getTotalTahunPengalaman(pengalaman) {
  const tahunMulai = pengalaman
    .map((item) => String(item.tahun || '').match(/\b(19|20)\d{2}\b/))
    .filter(Boolean)
    .map((match) => Number(match[0]));

  if (tahunMulai.length === 0) return 0;

  return Math.max(0, new Date().getFullYear() - Math.min(...tahunMulai));
}