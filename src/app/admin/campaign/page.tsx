import Link from 'next/link'
import { requireAdmin } from '@/lib/adminGuard'
import { createAdminClient } from '@/utils/supabase/server'
import { Users, CalendarDays, Clock3, Plus, ChevronRight, Sparkles, Inbox, ExternalLink } from 'lucide-react'
import { ParticipantTable, ParticipantUI } from './ParticipantTable'

type CampaignParticipantRow = {
  profile_id: string
  joined_at: string
  is_attended: boolean | null
}

type CampaignAdminRow = {
  id: number
  title: string
  start_time: string
  end_time: string
  max_participants: number
  status: 'upcoming' | 'ongoing' | 'finished' | 'cancelled'
  organizer_name: string
  campaign_participants: CampaignParticipantRow[] | null
}

function formatDateTime(dateValue: string) {
  return new Date(dateValue).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function determineCampaignStatus(
  startTime: string,
  endTime: string,
  dbStatus: CampaignAdminRow['status']
): CampaignAdminRow['status'] {
  if (dbStatus === 'finished' || dbStatus === 'cancelled') return dbStatus;
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'finished';
}

function statusBadge(status: CampaignAdminRow['status']) {
  if (status === 'upcoming') return 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
  if (status === 'ongoing') return 'bg-[#059669]/15 dark:bg-[#059669]/20 text-[#059669] dark:text-emerald-300 border-[#059669]/30'
  if (status === 'cancelled') return 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
  return 'bg-[#E2E8F0] dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] border-[#CBD5E1] dark:border-[#334155]'
}

function statusLabel(status: CampaignAdminRow['status']) {
  if (status === 'upcoming') return 'Akan Datang'
  if (status === 'ongoing') return 'Sedang Berlangsung'
  if (status === 'cancelled') return 'Dibatalkan'
  return 'Selesai'
}

export const metadata = {
  title: 'Kelola Campaign - Admin WasteCare',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminCampaignManagementPage({ searchParams }: PageProps) {
  const { supabase } = await requireAdmin()
  const adminSupabase = await createAdminClient()
  
  const resolvedSearchParams = await searchParams
  const filterStatus = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'all'

  // Fetch campaigns
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      start_time,
      end_time,
      max_participants,
      status,
      organizer_name,
      campaign_participants(profile_id, joined_at, is_attended)
    `)
    .order('start_time', { ascending: false })

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-4 text-xs">
          Gagal memuat data campaign: {error.message}
        </div>
      </div>
    )
  }

  // Apply computed status filter
  const allCampaigns = (data || []) as CampaignAdminRow[]
  const campaigns = filterStatus === 'all'
    ? allCampaigns
    : allCampaigns.filter(c => determineCampaignStatus(c.start_time, c.end_time, c.status) === filterStatus)

  const participantIds = Array.from(
    new Set(
      campaigns.flatMap((campaign) =>
        (campaign.campaign_participants || []).map((participant) => participant.profile_id)
      )
    )
  )

  const participantDirectory = new Map<string, { fullName: string; email: string }>()

  await Promise.all(
    participantIds.map(async (participantId) => {
      const { data: userData } = await adminSupabase.auth.admin.getUserById(participantId)
      const user = userData?.user

      participantDirectory.set(participantId, {
        fullName: (user?.user_metadata?.full_name as string | undefined) || 'Tanpa Nama',
        email: user?.email || '-',
      })
    })
  )

  const FILTERS = [
    { value: 'all', label: 'Semua Campaign' },
    { value: 'upcoming', label: 'Akan Datang' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'finished', label: 'Selesai' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#059669] dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={13} />
            <span>Manajemen Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Kelola Campaign Kebersihan</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Pantau program aksi bersih lingkungan dan verifikasi presensi relawan.</p>
        </div>

        <Link
          href="/admin/campaign/buat"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#059669]/20 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Buat Campaign Baru</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#111827] p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm dark:shadow-lg dark:shadow-black/10">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/admin/campaign' : `/admin/campaign?status=${f.value}`}
            className={`px-4 py-2 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
              filterStatus === f.value
                ? 'bg-[#059669] text-white font-bold shadow-md shadow-[#059669]/20'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/70'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Campaign Cards List */}
      {campaigns.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] dark:bg-[#1E293B] flex items-center justify-center mx-auto text-[#94A3B8]">
            <Inbox size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-200">Belum Ada Campaign</h3>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">
              Tidak ada data campaign yang cocok dengan filter yang dipilih.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {campaigns.map((campaign) => {
            const computedStatus = determineCampaignStatus(campaign.start_time, campaign.end_time, campaign.status);
            const rawParticipants = campaign.campaign_participants || []
            const participantCount = rawParticipants.length
            const percentage = campaign.max_participants > 0
              ? Math.min((participantCount / campaign.max_participants) * 100, 100)
              : 0

            const mappedParticipants: ParticipantUI[] = rawParticipants.map(p => {
              const info = participantDirectory.get(p.profile_id)
              return {
                profile_id: p.profile_id,
                joined_at: p.joined_at,
                is_attended: p.is_attended,
                fullName: info?.fullName || 'Tanpa Nama',
                email: info?.email || '-',
              }
            })

            return (
              <div 
                key={campaign.id} 
                className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm dark:shadow-xl dark:shadow-black/10 overflow-hidden"
              >
                {/* Header card */}
                <div className="p-5 sm:p-6 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B0F17]/50">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{campaign.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge(computedStatus)}`}>
                          {statusLabel(computedStatus)}
                        </span>
                      </div>

                      <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-4 pt-1">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-[#059669] dark:text-emerald-400" />
                          <span>{formatDateTime(campaign.start_time)}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} className="text-[#94A3B8]" />
                          <span>Sampai {formatDateTime(campaign.end_time)}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          <Users size={14} className="text-[#059669] dark:text-emerald-400" />
                          <span>{participantCount} / {campaign.max_participants} Peserta</span>
                        </span>
                      </div>

                      <p className="text-xs text-[#94A3B8]">Penyelenggara: <strong className="text-slate-800 dark:text-slate-200">{campaign.organizer_name}</strong></p>
                    </div>

                    <Link
                      href={`/campaign?campaignId=${campaign.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-xs font-semibold text-[#059669] dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 border border-[#CBD5E1] dark:border-[#334155] transition-colors self-start md:self-auto"
                    >
                      <span>Lihat Halaman Publik</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>

                  {/* Quota bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <span>Kapasitas Relawan</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(percentage)}% Terisi</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden border border-[#CBD5E1] dark:border-[#334155]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#059669] to-teal-500 transition-all duration-500" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Participants table section */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Daftar Presensi Relawan</h4>
                    <span className="text-xs text-[#94A3B8] font-mono">{mappedParticipants.length} Terdaftar</span>
                  </div>

                  {mappedParticipants.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#0B0F17]/30 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B]">
                      Belum ada relawan yang mendaftar ke campaign ini.
                    </div>
                  ) : (
                    <ParticipantTable 
                      campaignId={campaign.id} 
                      participants={mappedParticipants} 
                      isFinished={computedStatus === 'finished'} 
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
