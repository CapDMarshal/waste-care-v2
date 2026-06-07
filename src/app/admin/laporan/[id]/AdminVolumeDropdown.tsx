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
        <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
        <select
          disabled={disabled || isPending}
          value={initialVolume}
          onChange={handleChange}
          className="border border-gray-300 rounded-md py-1 px-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {Object.entries(WASTE_VOLUME_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {isPending && <span className="text-xs text-gray-500">Menyimpan...</span>}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
