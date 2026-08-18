import { requireAdmin } from '@/lib/adminGuard'
import { getAdminStatistics, getPendingReports } from '@/lib/adminService'
import Link from 'next/link'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronRight, 
  MapPin, 
  Sparkles, 
  ArrowUpRight,
  ShieldAlert,
  Flag,
  FileCheck2,
  Calendar
} from 'lucide-react'
import Image from 'next/image'

// This page is server-rendered completely
export const revalidate = 0

export default async function AdminDashboardPage() {
  await requireAdmin()
  
  const [statsData, pendingReports] = await Promise.all([
    getAdminStatistics(),
    getPendingReports()
  ])

  // Extract from the RPC response
  const stats = statsData || { pending_count: 0, approved_count: 0, rejected_count: 0, hazardous_count: 0, total_count: 0 }

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#059669] via-[#047857] to-[#064e3b] dark:from-[#059669]/20 dark:via-[#0F172A] dark:to-[#0B0F17] border border-[#059669]/30 dark:border-[#1E293B] p-6 sm:p-8 shadow-xl shadow-[#059669]/10">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-emerald-500/10 border border-white/20 dark:border-emerald-500/20 text-emerald-100 dark:text-emerald-300 text-xs font-semibold">
              <Sparkles size={13} />
              <span>AI-Assisted Waste Management Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Selamat Bertugas, Tim DLHK
            </h1>
            <p className="text-emerald-100/90 dark:text-[#94A3B8] text-sm sm:text-base max-w-2xl leading-relaxed">
              Pantau laporan tumpukan sampah dari masyarakat Kabupaten Sleman yang telah dianalisis otomatis oleh Vertex AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/laporan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#059669] hover:bg-[#F8FAFC] text-sm font-bold shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileCheck2 size={16} />
              <span>Validasi Laporan ({stats.pending_count})</span>
            </Link>
            <Link
              href="/admin/campaign/buat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-[#1E293B] dark:hover:bg-[#334155] text-white text-sm font-semibold border border-white/25 dark:border-[#334155] transition-all"
            >
              <Flag size={16} />
              <span>Buat Campaign</span>
            </Link>
          </div>
        </div>

        {/* Quick Meta Footer inside Hero */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/15 dark:border-[#1E293B] flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-100/80 dark:text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-emerald-200 dark:text-emerald-400" />
            <span className="text-white dark:text-slate-300 font-medium">{todayFormatted}</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Total Laporan Masuk: <strong className="text-white dark:text-slate-200">{stats.total_count}</strong></span>
            <span>Wilayah Operasional: <strong className="text-emerald-200 dark:text-emerald-400">Sleman</strong></span>
          </div>
        </div>
      </div>

      {/* KPI / Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Pending Card */}
        <Link 
          href="/admin/laporan?status=pending"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-amber-500/50 p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#94A3B8]">Menunggu Validasi</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stats.pending_count}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Clock size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Butuh tindakan segera
            </span>
            <ArrowUpRight size={14} className="text-[#94A3B8] group-hover:text-amber-500 transition-colors" />
          </div>
        </Link>

        {/* Approved Card */}
        <Link 
          href="/admin/laporan?status=approved"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#059669]/60 p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-[#059669]/5 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#94A3B8]">Laporan Disetujui</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stats.approved_count}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669] dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-[#059669] dark:text-emerald-400 font-semibold">Siap ditindaklanjuti</span>
            <ArrowUpRight size={14} className="text-[#94A3B8] group-hover:text-[#059669] transition-colors" />
          </div>
        </Link>

        {/* Hazardous Card */}
        <Link 
          href="/admin/laporan?status=hazardous"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-rose-500/50 p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-rose-500/5 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#94A3B8]">Berisiko Tinggi (B3)</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stats.hazardous_count}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Perlu penanganan khusus</span>
            <ArrowUpRight size={14} className="text-[#94A3B8] group-hover:text-rose-500 transition-colors" />
          </div>
        </Link>

        {/* Rejected Card */}
        <Link 
          href="/admin/laporan?status=rejected"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-400 dark:hover:border-slate-700 p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#94A3B8]">Laporan Ditolak</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stats.rejected_count}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E2E8F0]/60 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] group-hover:scale-110 transition-transform">
              <XCircle size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">Tidak memenuhi kriteria</span>
            <ArrowUpRight size={14} className="text-[#94A3B8] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Main Content Section: Pending Queue + SOP Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pending Reports (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock size={17} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Perlu Validasi Segera</h2>
                <p className="text-xs text-[#94A3B8]">Laporan warga yang menunggu verifikasi admin</p>
              </div>
            </div>

            <Link 
              href="/admin/laporan?status=pending"
              className="text-xs font-semibold text-[#059669] dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors group"
            >
              <span>Lihat Semua</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] overflow-hidden shadow-sm dark:shadow-xl dark:shadow-black/10">
            {pendingReports.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center mx-auto text-[#059669] dark:text-emerald-400">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Semua Laporan Telah Tervalidasi</h3>
                  <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">
                    Tidak ada antrean laporan pending saat ini. Sistem akan memberitahu Anda saat laporan baru masuk.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {pendingReports.slice(0, 5).map((report: any) => (
                  <Link 
                    href={`/admin/laporan/${report.id}`} 
                    key={report.id}
                    className="p-4 sm:p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 flex items-center gap-4 transition-all duration-200 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F1F5F9] dark:bg-[#1E293B] shrink-0 border border-[#E2E8F0] dark:border-[#334155]">
                      {report.image_urls?.[0] ? (
                        <Image 
                          src={report.image_urls[0]} 
                          alt="Bukti foto"
                          fill
                          sizes="96px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">
                          No Photo
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 uppercase tracking-wider">
                            Pending
                          </span>
                          <span className="text-xs font-mono text-[#94A3B8]">
                            #{report.id}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#94A3B8] shrink-0">
                          {new Date(report.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-[#059669] dark:group-hover:text-emerald-400 transition-colors truncate">
                        Sampah {report.waste_type || 'Campuran'}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={13} className="text-[#94A3B8] shrink-0" />
                          <span className="truncate">Area {report.location_category ? report.location_category.replace('_', ' ') : 'Lainnya'}</span>
                        </span>
                        <span>•</span>
                        <span>
                          Risiko: <strong className="text-slate-700 dark:text-slate-300 capitalize">{report.hazard_risk ? report.hazard_risk.replace('_', ' ') : 'Rendah'}</strong>
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Arrow */}
                    <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#94A3B8] group-hover:text-[#059669] dark:group-hover:text-emerald-400 transition-colors pl-2 shrink-0">
                      <span>Review</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Insights & SOP Guidelines */}
        <div className="space-y-6">
          {/* Quick AI Workflow Card */}
          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] p-5 space-y-4 shadow-sm dark:shadow-xl dark:shadow-black/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669] dark:text-emerald-400">
                <Sparkles size={17} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Alur Validasi AI</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Semua laporan warga diproses oleh model <strong>Vertex AI (Gemini 2.5 Flash)</strong> yang mengekstrak estimasi volume, tipe sampah, serta tingkat bahaya sebelum diverifikasi oleh petugas.
            </p>

            <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Deteksi Sampah Liar</span>
                <span className="text-[#059669] dark:text-emerald-400 font-semibold">Otomatis (Vision)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Penyaringan Non-Sampah</span>
                <span className="text-[#059669] dark:text-emerald-400 font-semibold">Aktif (Auto-Reject)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Klasifikasi Bahaya B3</span>
                <span className="text-[#059669] dark:text-emerald-400 font-semibold">Aktif</span>
              </div>
            </div>
          </div>

          {/* SOP Guidelines Card */}
          <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#111827]/70 border border-[#E2E8F0] dark:border-[#1E293B] p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert size={15} className="text-amber-500" />
              <span>Panduan Petugas DLHK</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed list-disc list-inside">
              <li>Lakukan verifikasi lokasi titik GPS sebelum menyetujui laporan.</li>
              <li>Jika sampah mengandung limbah medis / B3, teruskan ke status <strong>Berbahaya</strong>.</li>
              <li>Setelah laporan disetujui, buat <strong>Campaign Kebersihan</strong> untuk mengajak relawan warga.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
