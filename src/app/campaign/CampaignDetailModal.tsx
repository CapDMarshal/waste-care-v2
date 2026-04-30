'use client';

import React from 'react';
import type { Campaign } from '@/types/campaign.types';
import { formatWasteType } from '@/lib/nearbyReportsService';

interface CampaignDetailModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (campaignId: string) => void;
}

export function CampaignDetailModal({ campaign, isOpen, onClose, onJoin }: CampaignDetailModalProps) {
  if (!isOpen || !campaign) return null;

  const isFull = campaign.participants >= campaign.maxParticipants;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white pb-20 overflow-y-auto">
      <div className="relative h-64 bg-gray-200">
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/template-image.png';
          }}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{campaign.title}</h2>

        <p className="text-gray-600 mb-4">
          Diselenggarakan oleh <span className="font-semibold">{campaign.organizer}</span>
        </p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Deskripsi</h3>
          <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tanggal & Waktu</p>
              <p className="text-gray-900 font-medium">{formatDate(campaign.date)}</p>
              <p className="text-gray-900 font-medium">{campaign.time}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="text-gray-900 font-medium">{campaign.location.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Peserta</p>
              <p className="text-gray-900 font-medium mb-2">
                {campaign.participants} / {campaign.maxParticipants} orang
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min((campaign.participants / campaign.maxParticipants) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Informasi Sampah</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Jenis:</span>
              <div className="flex gap-1">
                {campaign.wasteTypes.map((type, index) => (
                  <span key={index} className="text-sm font-medium text-emerald-700">
                    {formatWasteType(type)}
                    {index < campaign.wasteTypes.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>

            {campaign.estimatedVolume && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Estimasi:</span>
                <span className="text-sm font-medium text-orange-700">{campaign.estimatedVolume}</span>
              </div>
            )}

            {campaign.reportIds && campaign.reportIds.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Titik Lokasi:</span>
                <span className="text-sm font-medium text-blue-700">{campaign.reportIds.length} lokasi</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>

          {campaign.status === 'upcoming' && !isFull && !campaign.isJoined && (
            <button
              onClick={() => {
                onJoin(campaign.id);
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
            >
              Ikut Bergabung
            </button>
          )}

          {campaign.isJoined && campaign.status === 'upcoming' && (
            <button
              disabled
              className="flex-1 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-semibold cursor-default flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sudah Bergabung
            </button>
          )}

          {isFull && campaign.status === 'upcoming' && !campaign.isJoined && (
            <button
              disabled
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
            >
              Penuh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
