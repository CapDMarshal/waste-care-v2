'use client'

import React, { useState, useTransition } from 'react'
import { WasteVolume, WASTE_VOLUME_LABELS } from '@/lib/wasteVolume'
import { updateVolumeAction } from './actions'

interface AdminVolumeDropdownProps {
  reportId: number
  initialVolume: string
  disabled?: boolean
}

export default function AdminVolumeDropdown({ reportId, initialVolume, disabled }: AdminVolumeDropdownProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVolume = e.target.value
    startTransition(async () => {
      try {
        setError(null)
        await updateVolumeAction(reportId, newVolume)
      } catch (err: any) {
        setError(err.message || 'Gagal mengubah volume')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <select
          disabled={disabled || isPending}
          value={initialVolume}
          onChange={handleChange}
          className="border border-[#CBD5E1] dark:border-[#334155] rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#0B0F17] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs dark:shadow-none"
        >
          {Object.entries(WASTE_VOLUME_LABELS).map(([value, label]) => (
            <option key={value} value={value} className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100">
              {label}
            </option>
          ))}
        </select>
        {isPending && <span className="text-xs text-[#059669] dark:text-emerald-400 animate-pulse">Menyimpan...</span>}
      </div>
      {error && <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span>}
    </div>
  )
}



