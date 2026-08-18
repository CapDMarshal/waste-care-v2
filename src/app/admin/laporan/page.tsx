import { requireAdmin } from '@/lib/adminGuard'
import { getAllReportsAdmin } from '@/lib/adminService'
import { Database } from '@/types/database.types'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MapPin, 
  ChevronRight, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles,
  Inbox,
} from 'lucide-react'

type ReportStatus = Database['public']['Enums']['report_status_enum']

export const revalidate = 0

export default async function AdminLaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  
  const currentStatus = (params.status as ReportStatus) || undefined
  const reports = await getAllReportsAdmin(currentStatus)
  
  const tabs = [
    { label: 'Semua', value: '', icon: Inbox },
    { label: 'Pending', value: 'pending', icon: Clock },
    { label: 'Disetujui', value: 'approved', icon: CheckCircle2 },
    { label: 'Berbahaya (B3)', value: 'hazardous', icon: AlertTriangle },
    { label: 'Ditolak', value: 'rejected', icon: XCircle }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Menunggu
          </span>
        )
      case 'approved': 
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#059669]/15 dark:bg-[#059669]/20 text-[#059669] dark:text-emerald-300 border border-[#059669]/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            Disetujui
          </span>
        )
      case 'hazardous': 
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Berbahaya
          </span>
        )
      case 'rejected': 
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#E2E8F0] dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] border border-[#CBD5E1] dark:border-[#334155] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Ditolak
          </span>
        )
      default: return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#059669] dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={13} />
            <span>Manajemen Data</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Daftar Laporan Warga</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Review, verifikasi, dan kelola laporan tumpukan sampah di wilayah Sleman.</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-slate-600 dark:text-slate-300 shadow-xs self-start sm:self-auto">
          <span>Menampilkan:</span>
          <strong className="text-[#059669] dark:text-emerald-400 font-bold">{reports.length} Laporan</strong>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="bg-white dark:bg-[#111827] p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm dark:shadow-lg dark:shadow-black/10">
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.value || (!currentStatus && tab.value === '')
          const Icon = tab.icon
          return (
            <Link 
              key={tab.value}
              href={`/admin/laporan${tab.value ? `?status=${tab.value}` : ''}`}
              className={`inline-flex items-center gap-2 px-4 py-2 font-medium text-xs sm:text-sm rounded-xl whitespace-nowrap transition-all duration-200 ${
                isActive 
                  ? 'bg-[#059669] text-white font-bold shadow-md shadow-[#059669]/20' 
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/70'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Report Cards Grid */}
      {reports.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] dark:bg-[#1E293B] flex items-center justify-center mx-auto text-[#94A3B8]">
            <Inbox size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">Tidak Ada Laporan Ditemukan</h3>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">
              Tidak ada data laporan yang cocok dengan filter status saat ini.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report: any) => (
            <Link
              key={report.id}
              href={`/admin/laporan/${report.id}`}
              className="group block bg-white dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#059669]/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-lg dark:shadow-none cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                {/* Image */}
                <div className="relative w-full sm:w-36 h-40 sm:h-28 rounded-xl overflow-hidden bg-[#F1F5F9] dark:bg-[#1E293B] shrink-0 border border-[#E2E8F0] dark:border-[#334155]">
                  {report.image_urls?.[0] ? (
                    <Image 
                      src={report.image_urls[0]} 
                      alt="Foto laporan"
                      fill
                      sizes="(max-width: 640px) 100vw, 144px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">
                      No Photo
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report.status)}
                      <span className="text-xs font-mono text-[#94A3B8]">
                        #{report.id}
                      </span>
                    </div>

                    <span className="text-xs text-[#94A3B8]">
                      {new Date(report.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#059669] dark:group-hover:text-emerald-400 transition-colors truncate">
                    Sampah {report.waste_type || 'Campuran'}
                  </h3>

                  {/* AI Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border border-[#E2E8F0] dark:border-[#334155]">
                      <MapPin size={12} className="text-[#059669] dark:text-emerald-400" />
                      <span>{report.location_category ? report.location_category.replace('_', ' ') : 'Area Terbuka'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border border-[#E2E8F0] dark:border-[#334155] capitalize">
                      <span>Risiko:</span>
                      <strong className={report.hazard_risk === 'tinggi' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
                        {report.hazard_risk ? report.hazard_risk.replace('_', ' ') : 'Rendah'}
                      </strong>
                    </span>
                  </div>

                  {report.notes && (
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-1 italic bg-[#F8FAFC] dark:bg-[#0B0F17]/50 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B]">
                      "{report.notes}"
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex self-center shrink-0 pl-2">
                  <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] group-hover:text-[#059669] dark:group-hover:text-emerald-400 group-hover:border-[#059669]/50 group-hover:bg-[#059669]/10 transition-all">
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  )
}



