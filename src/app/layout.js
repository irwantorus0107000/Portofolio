import './globals.css';
import Script from 'next/script';
import { getConfig } from '../lib/data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://irwantositous.my.id/';

export function generateMetadata() {
  const config = getConfig();
  const name = config.nama || 'Irwanto Sitorus';
  const description = config.tentang || 'Portfolio profesional di bidang keamanan siber dan infrastruktur jaringan.';
  const profileImage = config.foto_profil || '/images/LogoIR.jpeg';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${name} | IT Security & Network Professional`,
      template: `%s | ${name}`,
    },
    description,
    keywords: [
      'Irwanto Sitorus',
      'IT Security Professional',
      'cyber security Indonesia',
      'network security',
      'network infrastructure',
      'penetration testing',
      'Irwan',
      'Sitorus',
      'CCTV',
      'ACS',
      'access control',
      'security system',
      'keamanan gedung',
      'sistem keamanan',
    ],
    authors: [{ name }],
    creator: name,
    category: 'technology',
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: siteUrl,
      title: `${name} | IT Security & Network Professional`,
      description,
      siteName: `${name} Portfolio`,
      images: [{ url: profileImage, alt: `Foto profil ${name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | IT Security & Network Professional`,
      description,
      images: [profileImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    icons: { icon: [{ url: '/images/LogoIR.jpeg', type: 'image/jpeg' }] },
  };
}

export default function RootLayout({ children }) {
  const config = getConfig();
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.nama || 'Irwanto Sitorus',
    jobTitle: 'IT Security & Network Professional',
    description: config.tentang || 'Profesional keamanan siber dan infrastruktur jaringan.',
    url: siteUrl,
    image: config.foto_profil ? new URL(config.foto_profil, siteUrl).toString() : `${siteUrl}/images/LogoIR.jpeg`,
    email: config.email || undefined,
    sameAs: [config.linkedin, config.github].filter(Boolean),
    knowsAbout: [
      'Cyber security',
      'Network security',
      'CCTV',
      'ACS',
      'Access control',
      'Security system',
      'Keamanan gedung',
      'Network infrastructure',
    ],
  };

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <Script src="https://cdn.tailwindcss.com?plugins=forms,container-queries" strategy="beforeInteractive" />
        <script dangerouslySetInnerHTML={{__html: `
          document.addEventListener('contextmenu', function (event) { event.preventDefault(); });
          document.addEventListener('dragstart', function (event) {
            if (event.target instanceof HTMLImageElement) event.preventDefault();
          });
          document.addEventListener('keydown', function (event) {
            if ((event.ctrlKey || event.metaKey) && ['c', 'p', 's', 'u'].includes(event.key.toLowerCase())) {
              event.preventDefault();
            }
          });
        ` }} />
      </head>
      <body className="bg-[#000000] text-[#f4f4f4] antialiased overflow-x-hidden">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
        {children}
      </body>
    </html>
  );
}