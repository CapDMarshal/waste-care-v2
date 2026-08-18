'use client'

import React, { useState, useTransition } from 'react'
import { toggleAttendance } from './actions'
import { Check, X, Users } from 'lucide-react'

export type ParticipantUI = {
  profile_id: string
  joined_at: string
  is_attended: boolean | null
  fullName: string
  email: string
}

interface ParticipantTableProps {
  campaignId: number
  participants: ParticipantUI[]
  isFinished?: boolean
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

export function ParticipantTable({ campaignId, participants, isFinished = false }: ParticipantTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sortedParticipants = [...participants].sort(
    (a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
  )

  const displayedParticipants = sortedParticipants.slice(0, 5)
  const hasMore = sortedParticipants.length > 5

  const handleToggle = (profileId: string, newStatus: boolean) => {
    startTransition(() => {
      toggleAttendance(campaignId, profileId, newStatus)
    })
  }

  const renderTable = (data: ParticipantUI[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs sm:text-sm">
        <thead>
          <tr className="text-left text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <th className="py-2.5 pr-4 font-semibold">Nama Peserta</th>
            <th className="py-2.5 pr-4 font-semibold">Email</th>
            <th className="py-2.5 pr-4 font-semibold">Waktu Daftar</th>
            <th className="py-2.5 pr-4 font-semibold">Presensi Kehadiran</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
          {data.map((p) => (
            <tr key={p.profile_id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors">
              <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">{p.fullName}</td>
              <td className="py-3 pr-4 text-slate-600 dark:text-[#94A3B8]">{p.email}</td>
              <td className="py-3 pr-4 text-[#94A3B8] font-mono text-xs">{formatDateTime(p.joined_at)}</td>
              <td className="py-3 pr-4">
                {isFinished ? (
                  // Read-only attendance badge when campaign is finished
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    p.is_attended === true
                      ? 'bg-[#059669]/15 dark:bg-[#059669]/20 text-[#059669] dark:text-emerald-300 border border-[#059669]/30'
                      : p.is_attended === false
                      ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                      : 'bg-[#E2E8F0] dark:bg-[#1E293B] text-slate-700 dark:text-[#94A3B8] border border-[#CBD5E1] dark:border-[#334155]'
                  }`}>
                    {p.is_attended === true ? <><Check size={13} /> Hadir</> : p.is_attended === false ? <><X size={13} /> Tidak Hadir</> : '–'}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(p.profile_id, true)}
                      disabled={isPending || p.is_attended === true}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        p.is_attended === true
                          ? 'bg-[#059669]/15 dark:bg-[#059669]/20 text-[#059669] dark:text-emerald-300 border border-[#059669]/40'
                          : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[#E2E8F0] dark:hover:bg-[#334155] border border-[#CBD5E1] dark:border-[#334155]'
                      } disabled:opacity-80`}
                    >
                      <Check size={13} /> Hadir
                    </button>
                    <button
                      onClick={() => handleToggle(p.profile_id, false)}
                      disabled={isPending || p.is_attended === false}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        p.is_attended === false
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40'
                          : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[#E2E8F0] dark:hover:bg-[#334155] border border-[#CBD5E1] dark:border-[#334155]'
                      } disabled:opacity-80`}
                    >
                      <X size={13} /> Tidak Hadir
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      {renderTable(displayedParticipants)}

      {hasMore && (
        <div className="mt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-[#059669] dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
          >
            Lihat semua {participants.length} peserta terdaftar →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#059669] dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Semua Peserta ({participants.length})</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {renderTable(sortedParticipants)}
            </div>
            
            <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1E293B] flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#F1F5F9] dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-xs font-semibold transition-colors cursor-pointer border border-[#CBD5E1] dark:border-[#334155]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}



