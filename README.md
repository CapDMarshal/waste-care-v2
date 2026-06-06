# 🌍 WasteCare v2

WasteCare adalah sebuah platform berbasis komunitas dan pemerintah (DLHK) yang dirancang untuk mengatasi masalah sampah liar melalui partisipasi publik. Pengguna dapat melaporkan titik tumpukan sampah, dan sistem (yang didukung oleh AI) akan mengklasifikasikannya. Administrator kemudian dapat mengubah laporan yang tervalidasi menjadi sebuah **Campaign Kebersihan (Gotong Royong)** yang bisa diikuti oleh masyarakat luas.

## ✨ Fitur Utama (Current Implementation)

### Untuk Pengguna (Masyarakat)
- **📍 Pelaporan Sampah Interaktif:** Laporkan titik sampah langsung dari peta beserta foto kondisi di lapangan.
- **🤖 AI Waste Classification:** Terintegrasi dengan Google Cloud Vertex AI (Gemini 2.5 Flash) untuk mengklasifikasi jenis sampah (organik, anorganik, campuran) dan estimasi volume secara otomatis dari foto laporan. *Logika diisolasi secara aman menggunakan Supabase Edge Functions*.
- **🗺️ Eksplorasi Peta (Map View interaktif):** Lihat titik-titik sampah di sekitarmu yang belum dibersihkan dengan tata letak Bottom Sheet dinamis.
- **🤝 Ikut Campaign (Gotong Royong):** Daftar dan jadilah relawan pada campaign pembersihan yang diselenggarakan oleh DLHK atau komunitas.
- **👤 Manajemen Profil & Riwayat Laporan:** Pantau status laporan yang pernah diajukan (Menunggu, Disetujui, Ditolak, atau Berbahaya) secara terpusat pada menu Akun.
- **🔔 Pusat Notifikasi:** Dapatkan notifikasi *real-time* terkait perubahan status laporan dan pengingat otomatis via sistem (H-24 jam, H-12 jam) sebelum campaign dimulai.
- **📱 Autentikasi Pengguna & PWA:** Manajemen identitas secara aman menggunakan *Supabase Auth*, serta dilengkapi *PWA (Progressive Web App) Manifest* untuk mempermudah akses layaknya aplikasi native.

### Untuk Administrator (DLHK/Komunitas)
- **📋 Verifikasi Laporan:** Tinjau dan validasi laporan sampah dari masyarakat (Setujui, Tolak, atau tandai sebagai Berbahaya).
- **📅 Manajemen Campaign:** Buat *Campaign* kebersihan baru secara mudah berdasarkan titik laporan yang disetujui.
- **👥 Kelola Peserta:** Pantau siapa saja yang mendaftar dan kelola daftar hadir/absensi pada hari H (Hadir / Tidak Hadir).
- **📊 Dashboard Statistik Top-Level:** Visualisasi data sebaran jenis sampah, status campaign, dan tingkat partisipasi di layar utama (Landing Page).
- **⚙️ Pembatalan Otomatis (Smart Cron Job):** API webhook (`/api/cron/campaign-reminders`) yang divalidasi dengan `CRON_SECRET` siap di-trigger eksternal untuk melontarkan pengingat pesanan dan bahkan membatalkan campaign otomatis jika kuota minimal tak terpenuhi dalam waktu 24 jam sebelum acara dimulai.

### 🚧 Fitur Mendatang & Work-In-Progress
- **📱 Presensi Campaign Berbasis QR Code:** Sedang disiapkan pada modul `/scan-qr`. Berfungsi untuk mencatat kehadiran partisipan secara akurat berdasarkan lokasi.
- **🌐 Pengayaan AI Geolocation:** Rencana implementasi geolokasi rumah sakit dan *reverse geocoding* untuk menyempurnakan deteksi jenis sampah (contoh: limbah medis / *hazard_risk*).
- *Alur kerja AI selengkapnya dan rancangan tingkat lanjutnya dapat dilihat pada referensi terlampir: [`docs/vertex-ai-flow.md`](docs/vertex-ai-flow.md)*.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + RLS Policies, plus SSR Auth Cookie Integration)
- **AI Integration:** Google Cloud Vertex AI (via `gemini-2.5-flash`) berjalan pada Supabase Edge Functions.
- **Peta & Geolocation:** [MapLibre GL](https://maplibre.org/) / [MapTiler SDK](https://maptiler.com/)
- **Cron Jobs:** Eksternal trigger via cron-job.org ke API Route Next.js (`/api/cron/campaign-reminders`).

## 🚀 Panduan Instalasi Lokal

1. **Clone repositori ini**
   ```bash
   git clone https://github.com/username/waste-care-v2.git
   cd waste-care-v2
   ```

2. **Install dependensi**
   ```bash
   npm install
   # atau
   yarn install
   # atau
   bun install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env.local` di *root directory* dan isi dengan parameter dari Supabase dan Vertex AI Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   CRON_SECRET=your_secret_string_for_cron_auth
   
   # Google Cloud Vertex AI Credentials (digunakan pada Edge Function)
   GCP_PROJECT_ID=your_gcp_project_id
   GCP_CLIENT_EMAIL=your_gcp_client_email
   GCP_PRIVATE_KEY="your_gcp_private_key"
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   # atau
   bun dev
   ```

5. **Buka Aplikasi**
   Kunjungi [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📂 Struktur Proyek

- `src/app`: Berisi struktur halaman (Routing) Next.js App Router (termasuk modul admin, dashboard masyarakat, akun, buat campaign, dan api routes).
- `src/components`: Komponen UI yang disusun (*shadcn/ui-inspired* & *custom blocks*).
- `src/hooks`: Custom React Hooks untuk data-fetching Supabase (misal, `useCampaigns`).
- `src/lib` & `src/utils`: Server actions, fungsi *helper* eksternal (misal: SSR Server Auth helpers), dan logika Service (campaignService, reportService).
- `src/types`: Definisi tipe data statis TypeScript, termasuk skema autogenerate dari database Supabase (`database.types.ts`).
- `docs/`: Dokumentasi tambahan seperti alur arsitektur Vertex AI Edge Functions (`vertex-ai-flow.md`).

## 📜 Lisensi

Proyek ini dibangun untuk tujuan edukasi dan lingkungan. Silakan baca file [LICENSE](LICENSE) (jika ada) untuk informasi lebih lanjut mengenai ketentuan penggunaan.
