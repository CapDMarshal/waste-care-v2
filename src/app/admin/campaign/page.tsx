import Link from 'next/link'
import { requireAdmin } from '@/lib/adminGuard'
import { createAdminClient } from '@/utils/supabase/server'
import { Users, CalendarDays, Clock3, Plus, ChevronRight } from 'lucide-react'

type CampaignParticipantRow = {
  profile_id: string
  joined_at: string
}

type CampaignAdminRow = {
  id: number
  title: string
  start_time: string
  end_time: string
  max_participants: number
  status: 'upcoming' | 'ongoing' | 'finished'
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

function statusBadge(status: CampaignAdminRow['status']) {
  if (status === 'upcoming') {
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }
  if (status === 'ongoing') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

function statusLabel(status: CampaignAdminRow['status']) {
  if (status === 'upcoming') return 'Akan Datang'
  if (status === 'ongoing') return 'Berlangsung'
  return 'Selesai'
}

export const metadata = {
  title: 'Kelola Campaign - Admin',
}

export default async function AdminCampaignManagementPage() {
  const { supabase } = await requireAdmin()
  const adminSupabase = await createAdminClient()

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
      campaign_participants(profile_id, joined_at)
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

  const campaigns = (data || []) as CampaignAdminRow[]

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

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500">
          Belum ada campaign yang dibuat.
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const participants = campaign.campaign_participants || []
            const participantCount = participants.length
            const percentage = campaign.max_participants > 0
              ? Math.min((participantCount / campaign.max_participants) * 100, 100)
              : 0

            return (
              <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(campaign.status)}`}>
                          {statusLabel(campaign.status)}
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

                  {participants.length === 0 ? (
                    <p className="text-sm text-gray-500">Belum ada peserta yang mendaftar.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-gray-100">
                            <th className="py-2 pr-4 font-medium">Nama</th>
                            <th className="py-2 pr-4 font-medium">Email</th>
                            <th className="py-2 pr-4 font-medium">Waktu Daftar</th>
                            <th className="py-2 pr-4 font-medium">User ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants
                            .sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())
                            .map((participant) => {
                              const userInfo = participantDirectory.get(participant.profile_id)

                              return (
                                <tr key={`${campaign.id}-${participant.profile_id}`} className="border-b border-gray-50 last:border-0">
                                  <td className="py-2.5 pr-4 text-gray-900">{userInfo?.fullName || 'Tanpa Nama'}</td>
                                  <td className="py-2.5 pr-4 text-gray-700">{userInfo?.email || '-'}</td>
                                  <td className="py-2.5 pr-4 text-gray-600">{formatDateTime(participant.joined_at)}</td>
                                  <td className="py-2.5 pr-4 text-gray-500 font-mono text-xs">{participant.profile_id}</td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
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
