# Implementation Plan: Fitur 1 - Presensi Kampanye via QR Code Dinamis & Geofencing GPS Anti-Spoofing

**Aplikasi**: WasteCare V2 (Next.js 15 App Router, Supabase PostGIS, Tailwind CSS v4, PWA)  
**Dokumen Rujukan**: `pp_planning/visualisasi-fitur-pp.md` & Skripsi/PUI Bab 3–5  
**Lokasi Berkas**: `/pp_planning/fitur1-implementation-plan.md`  
**Status**: Ready for Execution

---

## 1. Executive Summary & Academic Context

### 1.1 Latar Belakang Masalah
Pada kegiatan aksi bersih-bersih lingkungan (*Environmental Clean-up Campaign*) di Kabupaten Sleman, pencatatan kehadiran relawan secara konvensional (tanda tangan kertas atau Google Forms) menghadapi kendala kritis:
1. **Titip Presensi (*Buddy Punching*)**: Tautan formulir kehadiran atau foto kode QR statis disebarkan ke grup percakapan sehingga relawan yang tidak hadir secara fisik tetap tercatat dan mendapatkan poin/reward (*gamification exploit*).
2. **Ketiadaan Bukti Spasial**: Admin DLHK Sleman tidak memiliki data verifikasi empiris mengenai keberadaan fisik relawan di titik koordinat tumpukan sampah yang dibersihkan.
3. **Bottleneck Antrean Manual**: Presensi manual di lokasi memicu kerumunan dan menghabiskan waktu operasional relawan sebelum aksi pembersihan dimulai.

### 1.2 Solusi & Kontribusi Ilmiah
Fitur 1 menghadirkan arsitektur presensi hibrida berlapis ganda (*Dual-Factor Physical Presence Verification*):
- **Lapisan Kriptografis Temporal**: QR Code berbasis token dinamis yang ditandatangani menggunakan **HMAC-SHA256** dengan masa aktif (*Time-to-Live* / TTL) 60 detik (+15 detik toleransi sinkronisasi jam). QR code berganti secara otomatis di layar admin/koordinator sehingga tangkapan layar (*screenshot*) yang dibagikan akan hangus dalam hitungan detik.
- **Lapisan Spasial PostGIS**: Validasi geofencing geospasial real-time menggunakan fungsi `ST_Distance` PostGIS pada model elipsoid WGS-84 (`geography`), membatasi radius kehadiran maksimal $\le 50$ meter dari koordinat target kampanye (`reports.location`).
- **Integritas Transaksional Atomik**: Seluruh proses validasi jarak, pencegahan duplikasi (*anti-replay*), pembaruan status `is_attended`, injeksi reward +100 EXP, dan pembuatan notifikasi sistem dikapsulkan dalam satu transaksi database PostgreSQL melalui Stored Procedure / RPC (`record_campaign_attendance`).

---

## 2. Arsitektur Teknis & Mekanisme Pengamanan

```
   ┌──────────────────────────────────────────────────────────────┐
   │                     ADMIN / KOORDINATOR                      │
   │           (/admin/campaign -> PresenceQRModal.tsx)           │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                 Request Token Tiap 50-60 Detik
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │             SERVER ACTION (generatePresenceToken)            │
   │  Payload: campaignId + expiresAt (now + 60s) + salt          │
   │  Signature: HMAC-SHA256(payload, QR_PRESENCE_SECRET)         │
   │  Format: base64Url(campaignId:expiresAt:salt:signature)      │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                      Menampilkan QR Dinamis
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                   RELAWAN / WARGA (PWA)                      │
   │           (/scan-qr -> Kamera + GPS High Accuracy)           │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
            Scan QR + Ambil Koordinat GPS (lat, lng, acc)
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │          SERVER ACTION (processPresenceCheckInAction)        │
   │  1. Verifikasi HMAC Signature & Timestamp (TTL + grace)      │
   │  2. Validasi Akurasi GPS Client (acc <= 40m)                 │
   │  3. Panggil PostGIS RPC: record_campaign_attendance          │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │             POSTGRESQL RPC (record_campaign_attendance)      │
   │  - Validasi keanggotaan partisipan (campaign_participants)    │
   │  - Validasi belum pernah presensi (is_attended IS NOT TRUE)   │
   │  - Hitung Jarak: ST_Distance(reports.location, user_gps)     │
   │  - Jarak <= 50m: SET is_attended = TRUE                      │
   │  - profiles.exp += 100 EXP                                    │
   │  - INSERT INTO notifications                                 │
   └──────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema & RPC Stored Procedure

### 3.1 DDL Perubahan Tabel `campaign_participants`
Menambahkan kolom audit jejak kehadiran:
```sql
-- Eksekusi di Supabase SQL Editor
ALTER TABLE public.campaign_participants
ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS check_in_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_in_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_in_distance DOUBLE PRECISION;

-- Indeks untuk efisiensi kueri absensi
CREATE INDEX IF NOT EXISTS idx_campaign_participants_checkin 
ON public.campaign_participants (campaign_id, profile_id, is_attended);
```

### 3.2 PostGIS Stored Procedure (`record_campaign_attendance`)
Prosedur atomik `SECURITY DEFINER` dengan pengembalian format JSON terstruktur:
```sql
CREATE OR REPLACE FUNCTION public.record_campaign_attendance(
  p_campaign_id BIGINT,
  p_user_id UUID,
  p_user_lat DOUBLE PRECISION,
  p_user_lng DOUBLE PRECISION,
  p_max_distance_meters DOUBLE PRECISION DEFAULT 50.0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_participant RECORD;
  v_campaign RECORD;
  v_distance DOUBLE PRECISION;
  v_user_point geography;
  v_new_exp INT;
BEGIN
  -- 1. Validasi keberadaan pendaftaran partisipan
  SELECT * INTO v_participant
  FROM campaign_participants
  WHERE campaign_id = p_campaign_id AND profile_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'NOT_REGISTERED',
      'message', 'Anda belum terdaftar sebagai relawan pada kampanye ini.'
    );
  END IF;

  -- 2. Cek apakah sudah pernah presensi sebelumnya (Idempotensi / Anti-duplikasi)
  IF v_participant.is_attended IS TRUE THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ALREADY_ATTENDED',
      'message', 'Anda sudah melakukan presensi sebelumnya pada kampanye ini.',
      'attended_at', v_participant.attended_at
    );
  END IF;

  -- 3. Ambil data kampanye dan koordinat spasial dari laporan terkait
  SELECT c.*, r.location, r.title AS report_title
  INTO v_campaign
  FROM campaigns c
  LEFT JOIN reports r ON c.report_id = r.id
  WHERE c.id = p_campaign_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'CAMPAIGN_NOT_FOUND',
      'message', 'Data kampanye tidak ditemukan.'
    );
  END IF;

  IF v_campaign.location IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'LOCATION_UNAVAILABLE',
      'message', 'Titik lokasi kampanye belum terkonfigurasi dengan benar.'
    );
  END IF;

  -- 4. Hitung jarak geospasial menggunakan PostGIS ST_Distance (WGS-84 elipsoid)
  v_user_point := ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography;
  v_distance := ST_Distance(v_campaign.location::geography, v_user_point);

  -- 5. Evaluasi geofencing threshold
  IF v_distance > p_max_distance_meters THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'OUT_OF_BOUNDS',
      'message', format('Lokasi Anda terlalu jauh dari titik aksi (%s meter). Maksimal toleransi adalah %s meter.', ROUND(v_distance::numeric, 1), p_max_distance_meters),
      'distance', ROUND(v_distance::numeric, 1),
      'max_distance', p_max_distance_meters
    );
  END IF;

  -- 6. Mutasi status kehadiran partisipan
  UPDATE campaign_participants
  SET 
    is_attended = TRUE,
    attended_at = NOW(),
    check_in_lat = p_user_lat,
    check_in_lng = p_user_lng,
    check_in_distance = ROUND(v_distance::numeric, 2)
  WHERE campaign_id = p_campaign_id AND profile_id = p_user_id;

  -- 7. Tambahkan reward gamifikasi (+100 EXP) ke profil partisipan
  UPDATE profiles
  SET exp = COALESCE(exp, 0) + 100
  WHERE id = p_user_id
  RETURNING exp INTO v_new_exp;

  -- 8. Buat entri notifikasi sistem untuk relawan
  INSERT INTO notifications (user_id, type, is_read, related_id)
  VALUES (p_user_id, 'campaign_update', FALSE, p_campaign_id);

  -- 9. Kembalikan respons sukses
  RETURN jsonb_build_object(
    'success', true,
    'code', 'CHECKIN_SUCCESS',
    'message', 'Presensi berhasil dicatat! Anda mendapatkan +100 EXP.',
    'campaign_id', p_campaign_id,
    'campaign_title', v_campaign.title,
    'distance', ROUND(v_distance::numeric, 1),
    'attended_at', NOW(),
    'new_exp', v_new_exp
  );
END;
$$;
```

---

## 4. Dependensi & Pustaka Pendukung

Instalasi pustaka npm untuk scanning & encoding QR:
```bash
npm install html5-qrcode qrcode
npm install -D @types/qrcode
```
- **`qrcode`**: Digunakan di sisi server/client admin untuk merender SVG / Canvas QR Code berkecepatan tinggi tanpa dependensi eksternal.
- **`html5-qrcode`**: Pustaka open-source tangguh untuk akses kamera web PWA dengan dukungan deteksi frame real-time, kontrol torch (flash), dan penanganan orientasi mobile responsif.
- **`crypto` (Node.js Built-in)**: Digunakan di Server Actions Next.js untuk hashing HMAC-SHA256 tanpa library pihak ketiga.

---

## 5. Rencana Modul Kode & Alur Berkas

### 5.1 Matriks File yang Dibuat / Dimodifikasi

| Berkas | Status | Peran & Deskripsi |
|---|---|---|
| `src/types/database.types.ts` | **Modifikasi** | Penambahan tipe kolom baru `campaign_participants` dan signature fungsi RPC `record_campaign_attendance`. |
| `src/lib/qrPresence.ts` | **Baru** | Modul utilitas kriptografi: pembangkitan token HMAC (`generatePresenceToken`) dan verifikasi token (`verifyPresenceToken`). |
| `src/lib/distance.ts` | **Baru** | Rumus Haversine matematis untuk perhitungan preview jarak di client-side. |
| `src/app/admin/campaign/PresenceQRModal.tsx` | **Baru** | Komponen modal admin untuk menampilkan QR dinamis dengan progress bar hitung mundur 60 detik & tombol fullscreen. |
| `src/app/admin/campaign/actions.ts` | **Modifikasi** | Penambahan server action `generatePresenceTokenAction` dan `fetchCampaignAttendanceAction`. |
| `src/app/admin/campaign/page.tsx` | **Modifikasi** | Penambahan trigger tombol "Buka Sesi Presensi QR" pada daftar kampanye aktif. |
| `src/app/scan-qr/page.tsx` | **Modifikasi Total** | Rombak UI scanner kamera PWA: integrasi `html5-qrcode`, akurasi GPS, scanner viewfinder modern, dialog hasil sukses/gagal. |
| `src/app/scan-qr/actions.ts` | **Baru** | Server action pemroses presensi: validasi kriptografi token, koordinat GPS, dan eksekusi RPC PostGIS. |
| `src/app/campaign/CampaignCard.tsx` | **Modifikasi** | Penambahan tombol CTA kontekstual "Presensi Sekarang" bagi relawan terdaftar saat kampanye berstatus ongoing. |

---

## 6. Spesifikasi Teknis Implementasi (Step-by-Step)

### Fase 1: Database & Type Definition
1. Jalankan migrasi SQL DDL dan RPC `record_campaign_attendance` di Supabase SQL Editor.
2. Sinkronkan `src/types/database.types.ts`:
   - Tambahkan properti `attended_at: string | null`, `check_in_lat: number | null`, `check_in_lng: number | null`, `check_in_distance: number | null` pada `campaign_participants`.
   - Tambahkan definisi fungsi `record_campaign_attendance` pada antarmuka Database `Functions`.

### Fase 2: Mesin Kriptografi Token QR Dinamis
Buat file `src/lib/qrPresence.ts`:
- **Struktur Payload**:
  $$\text{Payload} = \text{campaignId} \mathbin{\Vert} \text{timestamp} \mathbin{\Vert} \text{salt}$$
- **Tanda Tangan Kriptografis**:
  $$\text{HMAC} = \text{HMAC-SHA256}(\text{Payload}, \text{QR\_PRESENCE\_SECRET})$$
- **Format Token Akhir**:
  $$\text{Token} = \text{base64url}(\text{campaignId} : \text{timestamp} : \text{salt} : \text{HMAC})$$
- **Toleransi Waktu**:
  Token dianggap valid jika $\text{currentTime} \le \text{timestamp} + \text{GRACE\_PERIOD}$ (di mana TTL = 60 detik, Grace Period = 15 detik).

### Fase 3: Portal Admin - Generator QR Dinamis
Buat `src/app/admin/campaign/PresenceQRModal.tsx`:
- Render kode QR resolusi tinggi menggunakan pustaka `qrcode` (SVG format).
- Indikator hitung mundur (*countdown progress bar*) visual yang menyusut dari 60 ke 0 detik.
- Mekanisme auto-refresh interval yang meminta token baru secara seamless via Server Action tanpa me-reload halaman.
- Tombol *Fullscreen Mode* untuk proyeksi proyektor / layar tablet koordinator di lapangan.
- Live counter jumlah relawan yang berhasil presensi secara real-time.

### Fase 4: PWA Relawan - Scanner Kamera & GPS Anti-Spoofing
Perbarui `src/app/scan-qr/page.tsx` & `src/app/scan-qr/actions.ts`:
1. **Pemeriksaan Izin Perangkat**:
   - Meminta izin kamera (`navigator.mediaDevices.getUserMedia`).
   - Meminta izin geolokasi presisi tinggi (`navigator.geolocation.getCurrentPosition` dengan opsi `enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 0`).
2. **Penyaringan Kualitas GPS**:
   - Jika nilai `accuracy > 40` meter, sistem memberikan peringatan bahwa sinyal GPS lemah dan meminta pengguna berpindah ke area terbuka sebelum memproses presensi.
3. **Eksekusi Presensi**:
   - Setelah QR berhasil didecode, payload token dan koordinat GPS `(lat, lng)` dikirim ke Server Action `processPresenceCheckInAction`.
   - Server Action memvalidasi integritas HMAC dan masa aktif token.
   - Server Action memanggil PostGIS RPC `record_campaign_attendance`.
4. **Modal Hasil Presensi**:
   - **Sukses**: Animasi centang hijau, badge perolehan `+100 EXP`, jarak terukur dari pusat kegiatan (misal: "18.4 meter dari lokasi"), dan tombol kembali ke halaman kampanye.
   - **Gagal Geofencing**: Ilustrasi peringatan jarak, informasi selisih jarak aktual versus ambang batas 50 meter.
   - **Gagal Token**: Peringatan QR kedaluwarsa dengan instruksi meminta admin memperlihatkan layar QR terbaru.

### Fase 5: Integrasi UI Kampanye
Perbarui `src/app/campaign/CampaignCard.tsx`:
- Tambahkan badge status dinamis:
  - Jika user sudah terdaftar dan kampanye berstatus `ongoing` serta belum presensi: Tampilkan tombol *"Presensi Kehadiran"* dengan ikon QR yang mengarahkan langsung ke `/scan-qr?campaign_id=[id]`.
  - Jika sudah presensi: Tampilkan badge hijau *"Sudah Presensi"*.

---

## 7. Matriks Pengujian & Penanganan Kasus Ekstrem (*Edge Cases*)

| Kasus Uji | Skenario | Ekspektasi Perilaku Sistem |
|---|---|---|
| **TC-01** | Presensi Sukses (Jarak $\le 50$m, QR Valid) | RPC sukses, `is_attended = true`, profil mendapat +100 EXP, modal sukses muncul. |
| **TC-02** | Geofencing Out-of-Bounds (Jarak $> 50$m) | RPC me-reject dengan kode `OUT_OF_BOUNDS`, menampilkan jarak aktual (misal: "82 meter dari lokasi"). Tidak ada EXP bertambah. |
| **TC-03** | QR Code Kedaluwarsa (> 75 detik) | Server Action menolak dengan kode `TOKEN_EXPIRED`. Permintaan tidak diteruskan ke database. |
| **TC-04** | QR Token Dipalsukan / Dimodifikasi | Server Action mendeteksi ketidaksesuaian HMAC (`INVALID_SIGNATURE`) dan memblokir akses. |
| **TC-05** | Titip Presensi / Replay Attack | Jika token di-screenshot dan dikirim ke teman di rumah, presensi teman akan gagal pada TC-02 (jarak $> 50$m) atau TC-03 (token hangus). |
| **TC-06** | Double Check-In | Jika men-scan QR untuk kedua kalinya, RPC mengembalikan kode `ALREADY_ATTENDED` tanpa menggandakan EXP. |
| **TC-07** | Partisipan Belum Mendaftar | RPC mengembalikan kode `NOT_REGISTERED` dan menyarankan relawan bergabung terlebih dahulu. |

---

## 8. Panduan Pertahanan Akademik (Sidang & Bimbingan Skripsi)

### Q1: Mengapa menggunakan Dynamic QR Code 60 detik dibanding QR Code statis di spanduk?
> **Jawaban**:  
> *"QR Code statis sangat rentan terhadap fraud titip presensi (*buddy punching*). Partisipan di lokasi dapat memotret QR statis tersebut dan menyebarkannya via WhatsApp Group, sehingga relawan yang tidak hadir tetap bisa melakukan check-in dari jarak jauh jika geofencing dimanipulasi dengan Mock GPS. Dengan Dynamic QR yang direfresh setiap 60 detik dengan signature HMAC-SHA256, jendela waktu penipuan ditutup rapat. Sekalipun foto QR disebarkan, token tersebut sudah hangus sebelum sempat digunakan orang lain."*

### Q2: Mengapa validasi geofencing dilakukan di database (PostGIS) dan bukan hanya di client/frontend?
> **Jawaban**:  
> *"Validasi di sisi frontend (*client-side*) sepenuhnya berada di luar kendali server dan rentan di-bypass dengan memodifikasi payload HTTP request via Postman, cURL, atau inspeksi DevTools. Dengan mendelegasikan validasi ke PostGIS Stored Procedure (`record_campaign_attendance`), perhitungan jarak `ST_Distance` dilakukan secara terpercaya (*trusted environment*) menggunakan model elipsoid bumi WGS-84, serta menjamin sifat ACID (Atomicity, Consistency, Isolation, Durability) dalam mutasi kehadiran dan penambahan EXP."*

### Q3: Mengapa batas toleransi radius ditetapkan sebesar 50 meter?
> **Jawaban**:  
> *"Berdasarkan literatur penentuan posisi satelit GNSS sipil pada perangkat smartphone (standar A-GPS / GPS L1), tingkat akurasi tipikal di area perkotaan dan semi-rural berkisar antara 5 hingga 15 meter dalam kondisi terbuka, dan dapat mengalami degradasi hingga 20-30 meter akibat efek *multipath* pantulan bangunan atau tutupan vegetasi pohon. Ditambah lagi, area tumpukan sampah liar dan radius pergerakan relawan saat aksi bersih-bersih (*cleanup zone*) mencakup bentang area tertentu. Toleransi 50 meter adalah kompromi optimal (*sweet spot*) antara mencegah presensi jarak jauh dan mencegah *false negative* bagi relawan yang memang berada di perimeter lapangan."*

---

*Dokumen ini merupakan acuan resmi pengembangan Fitur 1 WasteCare V2. Langkah selanjutnya adalah eksekusi SQL di Supabase diikuti implementasi bertahap dari Fase 1 hingga Fase 5.*
