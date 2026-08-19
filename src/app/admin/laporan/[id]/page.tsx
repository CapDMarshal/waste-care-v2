import { requireAdmin } from '@/lib/adminGuard'
import { getReportDetailAdmin } from '@/lib/adminService'
import { parseWKTPoint } from '@/lib/locationParser'
import AdminLocationSection from './AdminLocationSection'
import AdminVolumeDropdown from './AdminVolumeDropdown'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  Calendar,
  Sparkles,
  Flag,
  Check
} from 'lucide-react'
import { approveAction, rejectAction, forwardHazardousAction, finishAction } from './actions'

// Server component
export default async function AdminReportDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  await requireAdmin()
  const { id } = await params
  
  const report = await getReportDetailAdmin(parseInt(id, 10))
  if (!report) return notFound()

  // Parse location to get coordinates
  const coords = parseWKTPoint(report.location)

  // Status badge config
  const statusColors = {
    pending: 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    approved: 'bg-[#059669]/15 dark:bg-[#059669]/20 text-[#059669] dark:text-emerald-300 border border-[#059669]/30',
    rejected: 'bg-[#E2E8F0] dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] border border-[#CBD5E1] dark:border-[#334155]',
    hazardous: 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    finished: 'bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
        <Link 
          href="/admin/laporan" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[#E2E8F0] dark:border-[#1E293B] transition shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Laporan</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-[#94A3B8]">ID #{report.id}</span>
      </div>

      {/* Header Info */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm dark:shadow-xl dark:shadow-black/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${statusColors[report.status as keyof typeof statusColors] || statusColors.pending}`}>
              Status: {report.status}
            </span>
            <span className="text-xs text-[#059669] dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles size={13} />
              AI Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sampah {report.waste_type || 'Campuran'}
          </h1>
          
          <div className="text-xs text-[#94A3B8] flex items-center gap-2 pt-0.5">
            <Calendar size={13} className="text-[#94A3B8]" /> 
            <span>
              {new Date(report.created_at).toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Location Section */}
      {coords && (
        <AdminLocationSection 
          latitude={coords.latitude}
          longitude={coords.longitude}
          reportId={report.id}
        />
      )}

      {/* Photo & AI Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm dark:shadow-xl dark:shadow-black/10">
        
        {/* Photo Gallery */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Foto Bukti Laporan</h3>
            <span className="text-xs text-[#94A3B8]">{report.image_urls?.length || 0} Foto</span>
          </div>

          <div className="aspect-[4/3] bg-[#F1F5F9] dark:bg-[#0B0F17] rounded-2xl overflow-hidden relative border border-[#E2E8F0] dark:border-[#1E293B] shadow-inner">
            {report.image_urls?.[0] ? (
              <Image 
                src={report.image_urls[0]}
                alt="Bukti foto"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">
                Tidak ada foto
              </div>
            )}
          </div>

          {report.image_urls?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {report.image_urls.slice(1).map((imgUrl: string, i: number) => (
                <div key={i} className="w-20 h-20 relative rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] shrink-0">
                  <Image src={imgUrl} alt={`Foto ${i+2}`} fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Details & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4 text-xs sm:text-sm">
            
            {/* Volume */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B0F17]/60 border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
              <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">Volume Estimasi AI</p>
              <AdminVolumeDropdown 
                reportId={report.id} 
                initialVolume={report.waste_volume} 
                disabled={report.status !== 'pending'} 
              />
            </div>
            
            {/* Hazard Risk */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B0F17]/60 border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
              <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">Tingkat Bahaya (AI Analysis)</p>
              <p className={`font-bold capitalize flex items-center gap-2 ${report.hazard_risk === 'tinggi' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
                {report.hazard_risk === 'tinggi' && <AlertTriangle size={16} />}
                {report.hazard_risk ? report.hazard_risk.replace(/_/g, ' ') : 'Tidak Ada'}
              </p>
            </div>

            {/* Location Category */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B0F17]/60 border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
              <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">Kategori Area</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MapPin size={16} className="text-[#059669] dark:text-emerald-400" />
                {report.location_category ? report.location_category.replace(/_/g, ' ') : 'Lainnya'}
              </p>
            </div>

            {/* Reporter Notes */}
            {report.notes && (
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B0F17]/60 border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">Catatan Laporan</p>
                <div className="text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed">
                  "{report.notes}"
                </div>
              </div>
            )}
          </div>
          
          {/* Action Bar */}
          {report.status === 'pending' && (
            <div className="pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Keputusan Validasi Petugas</h3>
              
              {/* Approve Form */}
              <form action={async () => { 'use server'; await approveAction(report.id) }}>
                <button 
                  type="submit" 
                  className="w-full flex justify-center items-center gap-2 bg-[#059669] hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-[#059669]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm"
                >
                  <CheckCircle2 size={18} />
                  <span>Setujui Laporan (Valid)</span>
                </button>
              </form>
              
              <div className="grid grid-cols-2 gap-3">
                <form action={async () => { 'use server'; await forwardHazardousAction(report.id) }}>
                  <button 
                    type="submit" 
                    className="w-full justify-center flex items-center gap-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-semibold py-2.5 px-3 rounded-2xl transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    <AlertTriangle size={16} />
                    <span>Teruskan (B3)</span>
                  </button>
                </form>
                
                <form action={async () => { 'use server'; await rejectAction(report.id, "Ditolak oleh admin DLHK") }}>
                  <button 
                    type="submit" 
                    className="w-full justify-center flex items-center gap-2 bg-[#F1F5F9] hover:bg-rose-100 dark:bg-[#1E293B] dark:hover:bg-rose-500/20 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 border border-[#CBD5E1] hover:border-rose-300 dark:border-[#334155] dark:hover:border-rose-500/30 font-semibold py-2.5 px-3 rounded-2xl transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    <XCircle size={16} />
                    <span>Tolak Laporan</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Approved state (show campaign action & direct finish) */}
          {report.status === 'approved' && (
            <div className="pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
              <div className="bg-[#059669]/10 border border-[#059669]/30 text-[#059669] dark:text-emerald-300 p-4 rounded-2xl text-xs space-y-1 flex items-start gap-3">
                <CheckCircle2 className="shrink-0 mt-0.5 text-[#059669] dark:text-emerald-400" size={18} />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Laporan Telah Disetujui</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    {report.campaigns && report.campaigns.length > 0
                      ? 'Laporan ini sudah memiliki campaign kebersihan aktif. Anda dapat membuat campaign tambahan atau menandai laporan selesai dibersihkan.'
                      : 'Langkah berikutnya: Buat campaign kebersihan untuk mengajak partisipasi warga, atau langsung selesaikan dan bersihkan tumpukan sampah.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2.5">
                <Link 
                  href={`/admin/campaign/buat?reportId=${report.id}`}
                  className="w-full flex justify-center items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-slate-800 dark:text-white font-semibold py-3 px-4 rounded-2xl border border-[#CBD5E1] dark:border-[#334155] transition-colors text-xs sm:text-sm"
                >
                  <Flag size={16} className="text-[#059669] dark:text-emerald-400" />
                  <span>
                    {report.campaigns && report.campaigns.length > 0
                      ? 'Buat Campaign Tambahan'
                      : 'Buat Campaign Kebersihan'}
                  </span>
                </Link>
                <form action={async () => { 'use server'; await finishAction(report.id) }}>
                  <button 
                    type="submit" 
                    className="w-full flex justify-center items-center gap-2 bg-[#059669] hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-[#059669]/20 transition-all text-xs sm:text-sm cursor-pointer"
                  >
                    <Check size={18} />
                    <span>Selesaikan & Bersihkan</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Finished state */}
          {report.status === 'finished' && (
            <div className="pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 p-4 rounded-2xl text-xs flex items-start gap-3">
                <CheckCircle2 className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" size={18} />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Laporan Selesai Ditangani</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">Lokasi telah dibersihkan dan status tersimpan di arsip.</p>
                </div>
              </div>
            </div>
          )}

          {/* Hazardous state */}
          {report.status === 'hazardous' && (
            <div className="pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 p-4 rounded-2xl text-xs flex items-start gap-3">
                <AlertTriangle className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" size={18} />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Laporan Berbahaya (B3)</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">Telah dilimpahkan ke tim penanganan limbah B3 eksternal.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}



