'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { BottomNavigation } from '@/components';
import { useCampaigns } from '@/hooks/useCampaigns';
import type { Campaign } from '@/types/campaign.types';

const CampaignDetailModal = dynamic(
  () => import('./CampaignDetailModal').then((mod) => ({ default: mod.CampaignDetailModal })),
  { ssr: false }
);

const CampaignCard = dynamic(
  () => import('./CampaignCard').then((mod) => ({ default: mod.CampaignCard })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-48 bg-gray-200 rounded-xl mb-4" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    ),
  }
);

export default function CampaignPage() {
  const searchParams = useSearchParams();
  const { campaigns, loading, error, joinCampaign } = useCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'finished'>('all');
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);
  const [showJoinError, setShowJoinError] = useState<string | null>(null);
  const [joiningCampaignId, setJoiningCampaignId] = useState<string | null>(null);

  useEffect(() => {
    const campaignId = searchParams.get('campaignId');
    if (campaignId && campaigns.length > 0) {
      const campaign = campaigns.find((c) => c.id === campaignId);
      if (campaign) {
        setSelectedCampaign(campaign);
      }
    }
  }, [searchParams, campaigns]);

  const filteredCampaigns = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  const handleJoin = async (campaignId: string) => {
    try {
      setJoiningCampaignId(campaignId);
      await joinCampaign(campaignId);
      setShowJoinSuccess(true);
      setTimeout(() => setShowJoinSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal bergabung dengan campaign';
      setShowJoinError(errorMessage);
      setTimeout(() => setShowJoinError(null), 3000);
    } finally {
      setJoiningCampaignId(null);
    }
  };

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat campaign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Gagal Memuat Campaign</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Campaign Bersih-Bersih</h1>
          <p className="text-gray-600 text-sm">Bergabunglah dalam aksi gotong royong membersihkan lingkungan</p>
        </div>

        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { value: 'all', label: 'Semua' },
              { value: 'upcoming', label: 'Akan Datang' },
              { value: 'ongoing', label: 'Berlangsung' },
              { value: 'finished', label: 'Selesai' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as typeof filter)}
                className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                  filter === tab.value ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showJoinSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Berhasil bergabung dengan campaign!</span>
          </div>
        </div>
      )}

      {showJoinError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">{showJoinError}</span>
          </div>
        </div>
      )}

      <div className="px-4 py-6">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada campaign</h3>
            <p className="text-gray-500 text-sm">
              {filter === 'all'
                ? 'Campaign akan ditampilkan di sini'
                : `Belum ada campaign dengan status ${
                    filter === 'upcoming' ? 'akan datang' : filter === 'ongoing' ? 'berlangsung' : 'selesai'
                  }`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onJoin={handleJoin}
                onViewDetails={handleViewDetails}
                isJoining={joiningCampaignId === campaign.id}
              />
            ))}
          </div>
        )}
      </div>

      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onJoin={handleJoin}
      />

      <BottomNavigation />
    </div>
  );
}
