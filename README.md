# Portfolio Irwanto

Portfolio berbasis Next.js App Router.

## Menjalankan secara lokal

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`, lalu isi `ADMIN_PASSWORD` dengan password baru yang unik dan kuat (minimal 16 karakter). Jangan gunakan password lama atau unggah `.env.local` ke GitHub.

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Panel admin tersedia di `/admin`; login diverifikasi oleh server.

## Build production

```bash
npm run build
npm start
```

Atur `ADMIN_PASSWORD` secara rahasia di lingkungan hosting dan gunakan HTTPS. Panel belum memiliki pembatasan percobaan login; lindungi akses dengan pembatasan percobaan di penyedia hosting atau layanan autentikasi sebelum dipublikasikan.

Konten portfolio disimpan di `content/`, sedangkan aset publik berada di `public/`. Fitur admin membutuhkan penyimpanan file yang dapat ditulis dan persisten; pada hosting serverless perubahan bisa hilang atau tidak tersedia di semua instance.

Sebelum membuat repositori publik, periksa konten dan gambar agar tidak ada data yang tidak ingin dipublikasikan.

Untuk menjalankan tes keamanan:

```bash
npm run test:security
```
