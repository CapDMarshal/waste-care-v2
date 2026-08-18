import { requireAdmin } from '@/lib/adminGuard'
import { getAdminStatistics } from '@/lib/adminService'
import AdminSidebar from './AdminSidebar'
import { AdminThemeToggle } from './AdminThemeToggle'

export const metadata = {
  title: 'Admin Dashboard - WasteCare',
  description: 'Panel admin DLHK untuk mengelola laporan dan campaign kebersihan.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Guard the entire /admin/* route
  await requireAdmin()

  // Fetch quick stats for badge
  const stats = await getAdminStatistics().catch(() => null)
  const pendingCount = stats?.pending_count || 0

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans selection:bg-[#059669] selection:text-white transition-colors duration-200">
      {/* Sleek Modern Sidebar */}
      <AdminSidebar pendingCount={pendingCount} />

      {/* Main Content Area with Modern Surface */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9]/50 dark:bg-[#0F172A]/30">
        {/* Ambient Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/90 dark:bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-30 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Sistem Informasi Pengelolaan Sampah</span>
            <span>•</span>
            <span className="text-[#059669] dark:text-emerald-400 font-medium">Kabupaten Sleman, D.I. Yogyakarta</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E2E8F0]/60 dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
              <span className="font-medium">Pusat Kendali Aktif</span>
            </div>

            <AdminThemeToggle />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}



