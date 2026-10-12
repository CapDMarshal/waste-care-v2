# Agentic Planning: WasteCare V2 Agent & Context Architecture

Dokumen ini mendokumentasikan perencanaan arsitektur, domain bisnis, serta konfigurasi OpenCode Agent, Command, dan Skill untuk aplikasi **WasteCare V2** berdasarkan analisis dokumen akademik **PUI - Bab 5.docx** dan codebase **wesker/waste-care-v2**.

---

## 1. Domain & Arsitektur WasteCare V2

### 1.1 Latar Belakang & Masalah
- **Masalah**: Penumpukan sampah liar (*illegal dumping*) di fasilitas publik, khususnya di Kabupaten Sleman (Dinas Lingkungan Hidup dan Kebersihan / DLHK Sleman).
- **Kelemahan Sistem Konvensional**:
  - Pelaporan manual lambat dan birokratis.
  - Penumpukan verifikasi manual oleh petugas dinas (potensi *bottleneck* dan kelelahan kognitif).
  - Peta sebaran statis tanpa kemampuan *crowdsourcing* masyarakat secara *real-time*.
- **Solusi WasteCare V2**:
  - Progressive Web App (PWA) berbasis Mobile-First untuk kemudahan akses tanpa instalasi aplikasi *native* yang berat.
  - Integrasi kecerdasan buatan multimodal (**Google Cloud Vertex AI - Gemini 2.5 Flash**) sebagai penyaring awal (*first-pass filter*) otomatis untuk memverifikasi foto sampah, mengklasifikasikan jenis sampah, dan mengestimasi volume.
  - Dasbor spasial interaktif menggunakan **MapTiler SDK & Leaflet / MapLibre GL JS**.
  - Kolaborasi masyarakat dan pemerintah melalui modul **Kampanye Lingkungan** (kegiatan gotong royong pembersihan).

### 1.2 Tech Stack Utama
- **Framework Web**: Next.js 15 (App Router, React Server Components / RSC, Server Actions, React 19).
- **Styling**: Tailwind CSS v4 & Lucide React Icons.
- **Backend & Database**: Supabase (PostgreSQL + ekstensi PostGIS untuk geolokasi `geography(POINT)`).
- **Keamanan**: Supabase Auth + Row Level Security (RLS) ketat pada seluruh tabel.
- **AI Processing**: Supabase Edge Functions (`submit-report`) yang memanggil Google Cloud Vertex AI (`gemini-2.5-flash`) melalui autentikasi aman RSA Service Account JWT.
- **WebGIS**: MapTiler SDK (`@maptiler/sdk`), MapLibre GL (`maplibre-gl`), Leaflet.
- **PWA**: Service Worker, Web App Manifest, integrasi sensor kamera bawaan dan GPS geolocation.

---

## 2. Aktor & Alur Fungsionalitas Sistem

### 2.1 Aktor Pengguna (Masyarakat / Mobile PWA)
1. **Landing Page (`/`)**:
   - Hero section dengan ajakan pelaporan (*call-to-action*).
   - Pratinjau peta publik dan ringkasan statistik (total laporan, laporan terselesaikan, relawan).
2. **Autentikasi (`/login`, `/register`)**:
   - Supabase Auth (Email & Password, SSO GoogleButton).
3. **Peta Interaktif Dasbor (`/dashboard`)**:
   - Deteksi lokasi terkini (`useUserLocation`, `LocationPermissionButton`).
   - Penanda interaktif titik laporan sampah (`useNearbyReports`, `MapView`).
   - Bottom sheet detail laporan (`DashboardBottomSheet`).
4. **Alur Pelaporan Sampah (Multi-step Wizard)**:
   - `/lapor`: Penandaan titik koordinat GPS + peta mini akurasi.
   - `/lapor/foto`: Pengambilan foto bukti via kamera ponsel / file upload.
   - `/lapor/konfirmasi-data`: Ringkasan titik alamat (reverse geocoding) dan foto.
   - `/lapor/mengunggah`:
     - Unggah ke Supabase Storage (`report-images`).
     - Pemrosesan Edge Function `submit-report` dengan Vertex AI Gemini 2.5 Flash.
     - **Validasi AI**: Jika `is_waste: false`, laporan ditolak dan memunculkan `ErrorState` (HTTP 422). Jika valid, menyimpan data via SQL RPC `insert_report_with_location` dan memunculkan `SuccessMessage`.
5. **Modul Kampanye Lingkungan (`/buat-campaign`, `/akun/riwayat-laporan`)**:
   - Pendaftaran relawan kegiatan gotong royong pembersihan.
   - Pembuatan kampanye baru berbasis laporan yang disetujui.

### 2.2 Aktor Pengelola (Admin DLHK / Web Desktop)
1. **Dasbor Statistik Global (`/admin`)**:
   - Metrik laporan aktif, terselesaikan, rasio jenis sampah, dan sebaran wilayah.
2. **Manajemen Laporan (`/admin/laporan`, `/admin/laporan/[id]`)**:
   - Review detail foto, titik peta PostGIS, catatan pelapor, dan rekomendasi hasil inferensi AI.
   - **Perubahan Status Laporan**:
     - `pending`: Menunggu verifikasi petugas.
     - `approved`: Valid, disetujui untuk penjadwalan pengangkutan armada atau kampanye.
     - `rejected`: Ditolak (foto buram, bukan sampah, di luar cakupan layanan).
     - `hazardous`: Diteruskan/eskalasi karena limbah beracun/B3 atau medis.
     - `finished`: Selesai dibersihkan.
   - Penyesuaian estimasi volume armada (`1_pickup`, `1_truk_kecil`, `1_truk_besar`, `lebih_dari_1_truk_besar`).
3. **Manajemen Kampanye (`/admin/campaign`, `/admin/campaign/buat`)**:
   - Menjadwalkan aksi bersih-bersih, menentukan kuota peserta, dan memantau tabel partisipan.

---

## 3. Rencana Konfigurasi & Berkas OpenCode

Sesuai konvensi standar OpenCode yang didefinisikan dalam panduan `customize-opencode`:

### 3.1 Agent: `.opencode/agents/wastecare-expert.md`
- **Tujuan**: Sebagai agen spesialis rekayasa perangkat lunak untuk aplikasi WasteCare V2.
- **Kemampuan**:
  - Memahami struktur direktori monorepo/folder `wesker/waste-care-v2/`.
  - Menguasai konvensi Next.js 15 (App Router, Server Actions, Client Components `"use client"`, Tailwind CSS v4).
  - Menjaga integritas skema database PostgreSQL/PostGIS dan Row Level Security (RLS) Supabase.
  - Memahami alur inferensi Vertex AI di Supabase Edge Functions.
  - Menerapkan validasi status laporan dan tata kelola kampanye kebersihan.

### 3.2 Command: `.opencode/command/wastecare.md`
- **Tujuan**: Memfasilitasi eksekusi cepat menggunakan perintah slash `/wastecare <argumen>`.
- **Fungsi**: Memanggil agent `wastecare-expert` dengan instruksi terstruktur untuk menganalisis, merancang fitur, memperbaiki bug, atau memodifikasi kode WasteCare V2.

### 3.3 Skill: `.opencode/skills/wastecare-context/SKILL.md`
- **Tujuan**: Knowledge base terstruktur yang secara otomatis diinjeksi saat berinteraksi mengenai konteks WasteCare V2.
- **Isi**:
  - Konvensi arsitektur dan pola coding.
  - Skema tabel database (`reports`, `campaigns`, `campaign_participants`, `profiles`, `notifications`).
  - Definisi enum valid (`waste_type`, `hazard_risk`, `waste_volume`, `location_category`, `status`).
  - Alur kontrak Supabase Edge Function `submit-report`.
  - Roadmap pengembangan lanjutan (geofencing QR code, hazard risk proximity RSUD Sleman, gamifikasi).

### 3.4 Perintah Visualisasi Bimbingan: `.opencode/command/flow.md` & `.opencode/command/visualize.md`
- **Tujuan**: Menghasilkan visualisasi alur sistem (*flow*) dan algoritma yang disesuaikan secara khusus untuk presentasi bimbingan skripsi / tugas akhir.
- **Format Ganda**:
  - **Mermaid**: Untuk pratinjau langsung di editor Markdown, Notion, GitHub, atau Obsidian.
  - **PlantUML**: Dilengkapi dengan skinparam modern dan rapi untuk diekspor ke SVG/PNG beresolusi tinggi untuk dokumen Word skripsi dan slide PowerPoint.
- **Kelengkapan Tambahan**:
  - Analisis Input-Proses-Output (IPO) dan pseudocode berstruktur.
  - *Talking Points*: Narasi siap baca untuk mahasiswa saat mempresentasikan diagram di depan dosen pembimbing.
  - *Q&A Defense*: 2-3 pertanyaan kritis yang berpotensi diajukan dosen beserta kunci jawaban teknis/akademisnya.

### 3.5 Kebijakan Konfigurasi Global
- Konfigurasi `opencode.json` lokal tidak dibuat, memanfaatkan konfigurasi global OpenCode pengguna (`~/.config/opencode/opencode.json`).

---

## 4. Status Implementasi Berkas
1. Dokumen perencanaan arsitektur `agentic-planning.md` (**SELESAI**).
2. Direktori `.opencode/agents`, `.opencode/command`, `.opencode/skills/wastecare-context` (**SELESAI**).
3. Definisi agent `.opencode/agents/wastecare-expert.md` (**SELESAI**).
4. Template command `/wastecare` di `.opencode/command/wastecare.md` (**SELESAI**).
5. Template command visualisasi bimbingan `/flow` dan `/visualize` di `.opencode/command/` (**SELESAI**).
6. Knowledge base skill `.opencode/skills/wastecare-context/SKILL.md` (**SELESAI**).
7. Konfigurasi lokal `opencode.json` dilewati sesuai instruksi pengguna (memakai global).
