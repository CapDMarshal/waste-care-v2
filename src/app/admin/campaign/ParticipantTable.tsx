'use client'

import React, { useState, useTransition } from 'react'
import { toggleAttendance } from './actions'
import { Check, X } from 'lucide-react'

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
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 pr-4 font-medium">Nama</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Waktu Daftar</th>
            <th className="py-2 pr-4 font-medium">User ID</th>
            <th className="py-2 pr-4 font-medium">Kehadiran</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.profile_id} className="border-b border-gray-50 last:border-0">
              <td className="py-2.5 pr-4 text-gray-900">{p.fullName}</td>
              <td className="py-2.5 pr-4 text-gray-700">{p.email}</td>
              <td className="py-2.5 pr-4 text-gray-600">{formatDateTime(p.joined_at)}</td>
              <td className="py-2.5 pr-4 text-gray-500 font-mono text-xs">{p.profile_id}</td>
              <td className="py-2.5 pr-4">
                {isFinished ? (
                  // Read-only attendance badge when campaign is finished
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                    p.is_attended === true
                      ? 'bg-emerald-100 text-emerald-700'
                      : p.is_attended === false
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.is_attended === true ? <><Check size={14} /> Hadir</> : p.is_attended === false ? <><X size={14} /> Tidak Hadir</> : '–'}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(p.profile_id, true)}
                      disabled={isPending || p.is_attended === true}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        p.is_attended === true
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      } disabled:opacity-100`}
                    >
                      <Check size={14} /> Hadir
                    </button>
                    <button
                      onClick={() => handleToggle(p.profile_id, false)}
                      disabled={isPending || p.is_attended === false}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        p.is_attended === false
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      } disabled:opacity-100`}
                    >
                      <X size={14} /> Tidak Hadir
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
            className="text-sm text-green-700 font-medium hover:text-green-800 transition-colors"
          >
            Lihat semua {participants.length} peserta →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Semua Peserta ({participants.length})</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {renderTable(sortedParticipants)}
            </div>
            
            <div className="p-5 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
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
