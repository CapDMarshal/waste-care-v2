'use client'

import React, { useState } from 'react'
import { QrCode, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { PresenceQRModal } from './PresenceQRModal'

interface CampaignAdminActionsProps {
  campaignId: number
  campaignTitle: string
  status: 'upcoming' | 'ongoing' | 'finished' | 'cancelled'
}

export function CampaignAdminActions({
  campaignId,
  campaignTitle,
  status,
}: CampaignAdminActionsProps) {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  const canOpenQR = status === 'upcoming' || status === 'ongoing'

  return (
    <div className="flex items-center flex-wrap gap-2 self-start md:self-auto">
      {canOpenQR && (
        <button
          onClick={() => setIsQRModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-[#059669]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <QrCode size={14} />
          <span>Buka Sesi QR Presensi</span>
        </button>
      )}

      <Link
        href={`/campaign?campaignId=${campaignId}`}
        target="_blank"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-xs font-semibold text-[#059669] dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 border border-[#CBD5E1] dark:border-[#334155] transition-colors"
      >
        <span>Lihat Halaman Publik</span>
        <ExternalLink size={13} />
      </Link>

      <PresenceQRModal
        campaignId={campaignId}
        campaignTitle={campaignTitle}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  )
}
