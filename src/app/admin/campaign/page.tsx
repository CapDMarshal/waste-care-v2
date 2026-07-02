import Link from 'next/link'
import { requireAdmin } from '@/lib/adminGuard'
import { createAdminClient } from '@/utils/supabase/server'
import { Users, CalendarDays, Clock3, Plus, ChevronRight } from 'lucide-react'
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
  // Respect explicit finished/cancelled from DB
  if (dbStatus === 'finished' || dbStatus === 'cancelled') return dbStatus;
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'finished';
}

function statusBadge(status: CampaignAdminRow['status']) {
  if (status === 'upcoming') {
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }
  if (status === 'ongoing') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
  if (status === 'cancelled') {
    return 'bg-red-100 text-red-700 border-red-200'
  }
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

function statusLabel(status: CampaignAdminRow['status']) {
  if (status === 'upcoming') return 'Akan Datang'
  if (status === 'ongoing') return 'Berlangsung'
  if (status === 'cancelled') return 'Dibatalkan'
  return 'Selesai'
}

export const metadata = {
  title: 'Kelola Campaign - Admin',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminCampaignManagementPage({ searchParams }: PageProps) {
  const { supabase } = await requireAdmin()
  const adminSupabase = await createAdminClient()
  
  const resolvedSearchParams = await searchParams
  const filterStatus = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'all'

  // Always fetch all campaigns – filter by computed status in JS
  // (DB `status` column is never updated, so we compute status from start/end times)
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
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
    { value: 'all', label: 'Semua' },
    { value: 'upcoming', label: 'Akan Datang' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'finished', label: 'Selesai' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-green-600 mb-1">Manajemen Program</h2>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Campaign</h1>
          <p className="text-gray-500 mt-1">Pantau campaign dan lihat peserta yang sudah mendaftar.</p>
        </div>

        <Link
          href="/admin/campaign/buat"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 transition-colors"
        >
          <Plus size={18} />
          Buat Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/admin/campaign' : `/admin/campaign?status=${f.value}`}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
              filterStatus === f.value
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500">
          Belum ada campaign yang ditemukan.
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            // Recalculate status based on current time instead of relying on stale DB value
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
              <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(computedStatus)}`}>
                          {statusLabel(computedStatus)}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 flex flex-wrap items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDateTime(campaign.start_time)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {formatDateTime(campaign.end_time)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} />
                          {participantCount}/{campaign.max_participants} peserta
                        </span>
                      </div>

                      <p className="text-sm text-gray-500">Penyelenggara: {campaign.organizer_name}</p>
                    </div>

                    <Link
                      href={`/campaign?campaignId=${campaign.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
                    >
                      Lihat di halaman user
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Peserta Terdaftar</h4>

                  {mappedParticipants.length === 0 ? (
                    <p className="text-sm text-gray-500">Belum ada peserta yang mendaftar.</p>
                  ) : (
                    <ParticipantTable campaignId={campaign.id} participants={mappedParticipants} />
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
