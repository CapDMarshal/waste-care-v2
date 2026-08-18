import { requireAdmin } from '@/lib/adminGuard'
import CreateCampaignForm from '@/app/buat-campaign/CreateCampaignForm'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Buat Campaign - Admin WasteCare',
}

export default async function AdminCreateCampaignPage() {
  await requireAdmin()

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
        <Link 
          href="/admin/campaign" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[#E2E8F0] dark:border-[#1E293B] transition shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Kelola Campaign</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#059669] dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
          <Sparkles size={13} />
          <span>Manajemen Program</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Buat Campaign Kebersihan</h1>
        <p className="text-[#94A3B8] text-sm mt-1">
          Inisiasi program gotong royong dan aksi bersih lingkungan untuk menindaklanjuti laporan warga.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-sm dark:shadow-xl dark:shadow-black/10 border border-[#E2E8F0] dark:border-[#1E293B] p-6 md:p-8">
        <CreateCampaignForm />
      </div>
    </div>
  )
}



