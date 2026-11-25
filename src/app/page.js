import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getConfig, getTotalTahunPengalaman } from '../lib/data';
import Ticker from './ticker';
import MobileNavigation from './mobile-navigation';

export const dynamic = 'force-dynamic';

function getMarkdownFiles(folder) {
  const directory = path.join(process.cwd(), 'content', folder);

  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const file = fs.readFileSync(path.join(directory, filename), 'utf8');
      const { data } = matter(file);
      return { ...data, slug: filename.replace(/\.md$/, '') };
    });
}

const focusAreas = [
  {
    number: '01',
    title: 'Network & Perimeter',
    description: 'Keamanan jaringan, segmentasi, dan perlindungan perimeter.',
    tags: ['Network Security', 'Infrastructure', 'Risk Management'],
    color: 'cyan',
  },
  {
    number: '02',
    title: 'Cyber Security',
    description: 'Membangun dan menjaga infrastruktur digital yang tangguh.',
    tags: ['Security Systems', 'Security Architecture', 'Audit'],
    color: 'pink',
  },
  {
    number: '03',
    title: 'Physical Security',
    description: 'Sistem keamanan gedung dan kontrol akses terintegrasi.',
    tags: ['CCTV', 'ACS', 'Access Control'],
    color: 'amber',
  },
  {
    number: '04',
    title: 'Infrastructure',
    description: 'Perencanaan dan pengelolaan infrastruktur jaringan.',
    tags: ['Network', 'Availability', 'Operations'],
    color: 'green',
  },
];

const navigationLinks = [
  { href: '#tentang', label: 'TENTANG' },
  { href: '#keahlian', label: 'KEAHLIAN' },
  { href: '#pengalaman', label: 'PENGALAMAN' },
  { href: '#proyek', label: 'PROYEK' },
  { href: '#pendidikan', label: 'PENDIDIKAN' },
  { href: '#sertifikat', label: 'SERTIFIKAT' },
];

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="mb-2 block font-mono text-[13px] font-bold uppercase tracking-[0.2em] text-[#E58E17]">
          [ {eyebrow} ]
        </span>
        <h2 className="text-[clamp(1.75rem,1.25rem+2vw,2.5rem)] font-extrabold tracking-tight text-white">{title}</h2>
      </div>
      {description && (
        <p className="max-w-md font-mono text-sm leading-relaxed text-neutral-400">{description}</p>
      )}
    </div>
  );
}

export default function Home() {
  const config = getConfig();
  const pengalaman = getMarkdownFiles('pengalaman');
  const pendidikan = getMarkdownFiles('pendidikan');
  const sertifikat = getMarkdownFiles('sertifikat');
  const proyek = getMarkdownFiles('proyek');
  const yearsOfExperience = getTotalTahunPengalaman(pengalaman);
  const displayName = config.nama || 'Portfolio';
  const profileImage = config.foto_profil || '/images/LogoIR.jpeg';

  return (
    <>
      <header id="top" className="fixed left-0 top-0 z-50 w-full border-b border-white/5 bg-[#030305]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-5 sm:px-6 2xl:max-w-screen-2xl">
          <a className="flex min-w-0 items-center text-base font-black tracking-wider text-white transition-colors hover:text-[#00A3FF] sm:text-lg" href="#">
            <span className="truncate">{displayName.toUpperCase()}<span className="text-[#00A3FF]">.</span></span>
          </a>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-4 font-mono text-sm font-semibold tracking-wide text-neutral-300 xl:flex 2xl:gap-6">
            {navigationLinks.map(({ href, label }) => (
              <a key={href} className="transition-colors hover:text-[#00A3FF]" href={href}>{label}</a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 font-mono text-xs tracking-wide text-emerald-300 2xl:inline-flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              OPEN FOR COLLABORATION
            </span>
            <a className="border border-[#00A3FF]/50 bg-[#00A3FF]/10 px-3 py-2.5 font-mono text-sm font-bold text-[#00A3FF] transition-colors hover:bg-[#00A3FF] hover:text-black sm:px-4" href="#kontak">
              HUBUNGI
            </a>
            <MobileNavigation links={navigationLinks} />
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-40">
          <div className="tech-grid pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_20%,rgba(0,163,255,0.12),transparent_55%)]" />

          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 2xl:max-w-screen-2xl">
            <div className="hero-copy">
              <div className="mb-6 inline-flex max-w-full items-center gap-3 border border-[#E58E17]/40 bg-[#111622] px-3.5 py-2">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#E58E17]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E58E17]">
                  Defense · Infrastructure · Audit
                </span>
              </div>

              <h1 className="mb-6 text-[clamp(2rem,1rem+6vw,4.5rem)] font-extrabold uppercase leading-[1.04] tracking-tight text-white 2xl:text-[clamp(4.5rem,5vw,5.5rem)]">
                Security
                <br />
                &amp; Network
                <br />
                <span className="relative inline-block text-[#E11D48]">
                  Expert
                  <span className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-[#E11D48] via-[#00A3FF] to-transparent" />
                </span>
              </h1>

              <p className="mb-8 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
                {config.tentang || 'Membangun dan mengamankan infrastruktur digital masa depan.'}
              </p>

              <div className="mb-10 flex flex-wrap gap-4">
                <a className="inline-flex items-center gap-3 bg-[#00A3FF] px-7 py-4 text-sm font-extrabold uppercase tracking-wider text-black shadow-[0_0_25px_rgba(0,163,255,0.3)] transition-colors hover:bg-sky-300" href="#proyek">
                  Lihat Portofolio
                  <span aria-hidden="true" className="material-symbols-outlined text-base">north_east</span>
                </a>
                <a className="inline-flex items-center gap-2 border border-[#00A3FF]/40 bg-black/40 px-7 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#00A3FF]/10" href="#kontak">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-[#00A3FF]">terminal</span>
                  Hubungi Saya
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-neutral-800/80 pt-5 font-mono text-[13px] text-neutral-400">
                <span className="mr-1 uppercase tracking-wider text-neutral-500">Fokus:</span>
                {['Cyber Security', 'Network Infrastructure', 'CCTV & ACS', 'Access Control'].map((item) => (
                  <span key={item} className="border border-neutral-800 bg-[#111622] px-2.5 py-1.5 text-neutral-300">{item}</span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] lg:ml-auto 2xl:max-w-[600px]">
              <span className="pointer-events-none absolute -left-3 -top-3 z-20 h-8 w-8 border-l-2 border-t-2 border-[#00A3FF]" />
              <span className="pointer-events-none absolute -right-3 -top-3 z-20 h-8 w-8 border-r-2 border-t-2 border-[#00A3FF]" />
              <span className="pointer-events-none absolute -bottom-3 -left-3 z-20 h-8 w-8 border-b-2 border-l-2 border-[#00A3FF]" />
              <span className="pointer-events-none absolute -bottom-3 -right-3 z-20 h-8 w-8 border-b-2 border-r-2 border-[#00A3FF]" />
              <div className="absolute -bottom-4 -right-4 h-[92%] w-[92%] border-b-2 border-r-2 border-[#00A3FF]/80 shadow-[0_0_30px_rgba(0,163,255,0.2)]" />
              <div className="group relative z-10 aspect-square overflow-hidden border border-neutral-800 bg-[#0b0f19] shadow-2xl">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
                <span className="absolute left-4 top-4 z-20 border border-[#00A3FF]/30 bg-black/75 px-2.5 py-1 font-mono text-xs tracking-widest text-[#00A3FF]">
                  PROFILE // ONLINE
                </span>
                <img
                  alt={displayName}
                  className="h-full w-full object-cover object-top grayscale contrast-125 brightness-95 transition duration-700 group-hover:scale-105 group-hover:grayscale-[70%]"
                  src={profileImage}
                />
                <span className="absolute bottom-4 left-4 right-4 z-20 flex w-fit max-w-[calc(100%-2rem)] items-center gap-2 border border-white/10 bg-black/80 px-3 py-1.5 font-mono text-xs text-neutral-300">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  IT SECURITY PROFESSIONAL
                </span>
              </div>
              <div className="absolute -bottom-7 right-2 z-30 w-52 max-w-[85%] rotate-2 border-2 border-black bg-[#E58E17] p-4 text-neutral-950 shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-transform hover:rotate-0 sm:right-5">
                <div className="mb-1 flex items-center justify-between gap-2 font-mono text-xs font-black uppercase tracking-wide text-black/70">
                  <span>Professional Focus</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">verified_user</span>
                </div>
                <p className="text-sm font-black uppercase leading-tight">Network Security Specialist</p>
              </div>
            </div>
          </div>
        </section>

        <Ticker />

        <section className="relative py-14 sm:py-24" id="tentang">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 2xl:max-w-screen-2xl">
            <div className="relative">
              <div className="absolute -bottom-3 -right-3 inset-0 border-b-2 border-r-2 border-[#00A3FF] shadow-[0_0_30px_rgba(0,163,255,0.15)]" />
              <div className="relative grid grid-cols-1 items-center gap-10 border border-white/10 bg-[#0d1322] p-7 shadow-2xl sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
                <div className="lg:col-span-7">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[13px] uppercase tracking-widest text-[#00A3FF]">
                    <span aria-hidden="true" className="material-symbols-outlined text-base">fingerprint</span>
                    Biography &amp; Profile
                  </div>
                  <h2 className="mb-5 text-3xl font-black tracking-tight text-white sm:text-4xl">Tentang Saya</h2>
                  <p className="text-base leading-relaxed text-neutral-300">
                    {config.tentang || 'Profesional IT dengan fokus pada keamanan siber dan infrastruktur jaringan.'}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-neutral-400">
                    Berpengalaman menangani cyber security, CCTV, ACS, access control, security system, dan keamanan gedung.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/5 pt-6 font-mono text-sm text-neutral-400">
                    {['Keamanan Siber', 'Infrastruktur Jaringan', 'Sistem Keamanan'].map((item, index) => (
                      <span key={item} className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-base ${index === 1 ? 'text-[#E58E17]' : 'text-[#00A3FF]'}`}>check_circle</span>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-neutral-800/80 pt-7 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
                  <div className="border border-neutral-800 bg-[#07090d] p-5 transition-colors hover:border-[#00A3FF]/50">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-4xl font-black tracking-tight text-[#00A3FF] sm:text-5xl">{yearsOfExperience}+</span>
                      <span aria-hidden="true" className="material-symbols-outlined text-2xl text-[#00A3FF]">history</span>
                    </div>
                    <span className="block font-mono text-sm font-bold uppercase tracking-wider text-neutral-300">Tahun Pengalaman</span>
                    <p className="mt-1 font-mono text-sm text-neutral-400">Berdasarkan riwayat pengalaman</p>
                  </div>
                  <div className="border border-neutral-800 bg-[#07090d] p-5 transition-colors hover:border-[#E58E17]/50">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-4xl font-black tracking-tight text-[#E58E17] sm:text-5xl">{proyek.length}+</span>
                      <span aria-hidden="true" className="material-symbols-outlined text-2xl text-[#E58E17]">task_alt</span>
                    </div>
                    <span className="block font-mono text-sm font-bold uppercase tracking-wider text-neutral-300">Proyek Tercatat</span>
                    <p className="mt-1 font-mono text-sm text-neutral-400">Proyek yang ditampilkan di portfolio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-[#07090d] py-14 sm:py-20" id="keahlian">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 2xl:max-w-screen-2xl">
            <SectionTitle
              eyebrow="Matriks Keahlian"
              title="Infrastruktur & Cyber Capabilities"
              description="Area fokus dalam keamanan siber, infrastruktur jaringan, dan sistem keamanan."
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {focusAreas.map((area) => {
                const colorClass = {
                  cyan: 'border-[#00A3FF] text-[#00A3FF] bg-[#00A3FF]/10',
                  pink: 'border-[#E11D48] text-[#E11D48] bg-[#E11D48]/10',
                  amber: 'border-[#E58E17] text-[#E58E17] bg-[#E58E17]/10',
                  green: 'border-emerald-400 text-emerald-400 bg-emerald-400/10',
                }[area.color];

                return (
                  <article key={area.number} className={`group border-t-2 bg-[#111622] p-6 transition-colors hover:bg-[#161c2b] ${colorClass.split(' ')[0]}`}>
                    <div className={`mb-5 flex h-10 w-10 items-center justify-center border ${colorClass}`}>
                      <span className="font-mono text-sm font-bold">{area.number}</span>
                    </div>
                    <h3 className="mb-2 font-mono text-lg font-bold text-white">{area.title}</h3>
                    <p className="mb-5 text-base leading-relaxed text-neutral-300">{area.description}</p>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[13px] text-neutral-300">
                      {area.tags.map((tag) => (
                        <span key={tag} className="border border-neutral-800 bg-black/60 px-2 py-1">{tag}</span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#07090d] py-14 sm:py-20" id="pengalaman">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 2xl:max-w-screen-2xl">
            <SectionTitle eyebrow="Riwayat Profesional" title="Pengalaman Kerja" />
            {pengalaman.length > 0 ? (
              <div className="relative space-y-6 before:absolute before:bottom-0 before:left-4 before:top-0 before:w-px before:bg-gradient-to-b before:from-[#00A3FF] before:via-[#E58E17] before:to-transparent md:before:left-8">
                {pengalaman.map((item, index) => (
                  <article key={item.slug || index} className="relative ml-10 border border-white/5 bg-[#111622] p-6 shadow-xl transition-colors hover:border-[#00A3FF]/40 sm:p-8 md:ml-16">
                    <span className={`absolute -left-[2.05rem] top-8 h-4 w-4 rounded-full ring-4 ring-[#07090d] md:-left-[2.55rem] ${index === 0 ? 'bg-[#00A3FF]' : 'bg-[#E58E17]'}`} />
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-mono text-lg font-bold text-white sm:text-xl">{item.posisi}</h3>
                        <p className="mt-1 text-base font-semibold text-[#00A3FF]">{item.perusahaan}</p>
                      </div>
                      <span className="w-fit max-w-full break-words border border-[#00A3FF]/30 bg-[#00A3FF]/10 px-3.5 py-1.5 font-mono text-sm font-bold text-[#00A3FF]">{item.tahun}</span>
                    </div>
                    <p className="text-base leading-relaxed text-neutral-300">{item.deskripsi}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="border border-white/10 bg-[#111622] p-6 text-sm text-neutral-400">Belum ada data pengalaman kerja.</p>
            )}
          </div>
        </section>

        <section className="bg-[#030305] py-14 sm:py-20" id="proyek">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 2xl:max-w-screen-2xl">
            <SectionTitle
              eyebrow="Studi Kasus & Portfolio"
              title="Proyek yang Pernah Dikerjakan"
              description={proyek.length > 0 ? 'Portofolio proyek yang pernah dikerjakan.' : 'Proyek akan ditampilkan di sini setelah ditambahkan melalui panel admin.'}
            />
            {proyek.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {proyek.map((item, index) => (
                  <article key={item.slug || index} className="flex flex-col justify-between border border-white/10 bg-[#0d1322] p-6 shadow-xl transition-colors hover:border-[#00A3FF]/50">
                    <div>
                      <div className="mb-5 h-1 w-12 bg-[#00A3FF] shadow-[0_0_10px_#00A3FF]" />
                      <span className="mb-2 block font-mono text-sm font-bold uppercase tracking-wider text-[#E58E17]">{item.tahun}</span>
                      <h3 className="mb-3 font-mono text-lg font-bold text-white">{item.nama}</h3>
                      <p className="text-base leading-relaxed text-neutral-300">{item.deskripsi}</p>
                    </div>
                    {item.teknologi && <p className="mt-6 border-t border-neutral-800 pt-4 font-mono text-sm text-[#00A3FF]">{item.teknologi}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <p className="border border-white/10 bg-[#0d1322] p-6 text-sm text-neutral-400">Belum ada data proyek.</p>
            )}
          </div>
        </section>

        <section className="bg-[#07090d] py-14 sm:py-20" id="pendidikan">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 2xl:max-w-screen-2xl">
            <SectionTitle eyebrow="Akademik" title="Pendidikan" />
            {pendidikan.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {pendidikan.map((item, index) => (
                  <article key={item.slug || index} className="border border-white/10 bg-[#111622] p-6">
                    <span className="mb-2 block font-mono text-sm font-bold text-[#E58E17]">{item.tahun}</span>
                    <h3 className="text-xl font-bold text-white">{item.institusi}</h3>
                    <p className="mt-1 text-base text-neutral-300">{item.jurusan}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="border border-white/10 bg-[#111622] p-6 text-sm text-neutral-400">Belum ada data pendidikan.</p>
            )}
          </div>
        </section>

        <section className="bg-[#07090d] py-14 sm:py-20" id="sertifikat">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 2xl:max-w-screen-2xl">
            <SectionTitle eyebrow="Lisensi & Kredensial" title="Sertifikat" />
            {sertifikat.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sertifikat.map((item, index) => (
                  <article key={item.slug || index} className="overflow-hidden border-b-4 border-[#00A3FF] bg-[#111622] shadow-lg transition-colors hover:bg-[#161c2b]">
                    {item.gambar && (
                      <div className="flex h-52 items-center justify-center bg-black/40 p-3 sm:h-56">
                        <img alt={item.nama || 'Sertifikat'} className="h-full w-full object-contain" src={item.gambar} />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#E58E17]">Credential</span>
                        <span aria-hidden="true" className="material-symbols-outlined text-xl text-[#00A3FF]">verified</span>
                      </div>
                      <h3 className="font-mono text-lg font-bold leading-snug text-white">{item.nama}</h3>
                      {item.tahun_terbit && <p className="mt-2 font-mono text-sm text-neutral-300">Terbit: {item.tahun_terbit}</p>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="border border-white/10 bg-[#111622] p-6 text-sm text-neutral-400">Belum ada data sertifikat.</p>
            )}
          </div>
        </section>

      </main>

      <footer id="kontak" className="relative overflow-hidden border-t border-neutral-900 bg-black px-4 py-16 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
          <span className="break-words text-[clamp(2rem,7vw,5.5rem)] font-black uppercase leading-none tracking-tight text-[#171717]">{displayName}</span>
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 font-mono text-sm font-bold uppercase tracking-wider">
          <nav aria-label="Tautan kontak" className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {config.linkedin && (
              <a className="text-neutral-200 transition-colors hover:text-[#00A3FF]" href={config.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            )}
            {config.github && (
              <a className="text-neutral-200 transition-colors hover:text-[#00A3FF]" href={config.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
            {config.email && (
              <a className="text-neutral-200 transition-colors hover:text-[#00A3FF]" href={`mailto:${config.email}`}>Email</a>
            )}
          </nav>
          <span className="text-neutral-200">© {new Date().getFullYear()} {displayName} · IT Security &amp; Network</span>
        </div>
      </footer>
    </>
  );
}
