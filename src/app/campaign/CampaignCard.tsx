'use client';

import React from 'react';
import type { Campaign } from '@/types/campaign.types';
import { formatWasteType } from '@/lib/nearbyReportsService';

interface CampaignCardProps {
  campaign: Campaign;
  onJoin: (campaignId: string) => void;
  onViewDetails: (campaign: Campaign) => void;
  isJoining?: boolean;
}

export function CampaignCard({ campaign, onJoin, onViewDetails, isJoining = false }: CampaignCardProps) {
  const isAlmostFull = campaign.participants >= campaign.maxParticipants * 0.8;
  const isFull = campaign.participants >= campaign.maxParticipants;
  const participationPercentage = (campaign.participants / campaign.maxParticipants) * 100;

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

  const getStatusBadge = () => {
    const badges: Record<Campaign['status'], { text: string; color: string }> = {
      upcoming: { text: 'Akan Datang', color: 'bg-blue-100 text-blue-800' },
      ongoing: { text: 'Sedang Berlangsung', color: 'bg-green-100 text-green-800' },
      finished: { text: 'Selesai', color: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[campaign.status];
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.text}</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-200">
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/template-image.png';
          }}
        />
        <div className="absolute top-3 right-3">{getStatusBadge()}</div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{campaign.title}</h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-700">{campaign.location.name}</span>
          </div>

          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-700">
              {formatDate(campaign.date)} • {campaign.time}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-gray-700">{campaign.organizer}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {campaign.wasteTypes.map((type, index) => (
            <span key={index} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium">
              {formatWasteType(type)}
            </span>
          ))}
          {campaign.estimatedVolume && (
            <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-lg font-medium">{campaign.estimatedVolume}</span>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Peserta</span>
            <span className={`font-semibold ${isAlmostFull ? 'text-orange-600' : 'text-gray-900'}`}>
              {campaign.participants}/{campaign.maxParticipants}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isFull ? 'bg-red-500' : isAlmostFull ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(participationPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(campaign)}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Detail
          </button>

          {campaign.status === 'upcoming' && !isFull && !campaign.isJoined && (
            <button
              onClick={() => onJoin(campaign.id)}
              disabled={isJoining}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-colors ${
                isJoining ? 'bg-emerald-400 text-white cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Ikut Bergabung'
              )}
            </button>
          )}

          {campaign.isJoined && campaign.status === 'upcoming' && (
            <button
              disabled
              className="flex-1 px-4 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-semibold cursor-default flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sudah Bergabung
            </button>
          )}

          {isFull && campaign.status === 'upcoming' && !campaign.isJoined && (
            <button
              disabled
              className="flex-1 px-4 py-2.5 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
            >
              Penuh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
