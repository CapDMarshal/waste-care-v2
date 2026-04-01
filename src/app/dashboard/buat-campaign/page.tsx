'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Toast } from '@/components';

export default function BuatCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    maxParticipants: '',
    organizerType: 'personal' as 'personal' | 'organization',
    organizerName: '',
    description: ''
  });

  // Get report data from URL params
  const reportId = searchParams.get('reportId');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const location = searchParams.get('location') || 'Lokasi dari laporan';

  useEffect(() => {
    // Set default organizer name from user
    if (user?.user_metadata?.full_name) {
      setFormData(prev => ({
        ...prev,
        organizerName: user.user_metadata.full_name
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        setToast({ message: 'Judul campaign harus diisi', type: 'error' });
        setLoading(false);
        return;
      }

      if (!formData.date) {
        setToast({ message: 'Tanggal campaign harus diisi', type: 'error' });
        setLoading(false);
        return;
      }

      if (!formData.time) {
        setToast({ message: 'Waktu campaign harus diisi', type: 'error' });
        setLoading(false);
        return;
      }

      const maxParticipants = parseInt(formData.maxParticipants);
      if (!maxParticipants || maxParticipants < 2) {
        setToast({ message: 'Minimal partisipan adalah 2 orang', type: 'error' });
        setLoading(false);
        return;
      }

      if (!formData.organizerName.trim()) {
        setToast({ message: 'Nama penyelenggara harus diisi', type: 'error' });
        setLoading(false);
        return;
      }

      // TODO: Submit to Supabase
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));

      const campaignData = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        maxParticipants: maxParticipants,
        organizerType: formData.organizerType,
        organizerName: formData.organizerName,
        description: formData.description,
        reportId: reportId,
        location: {
          name: location,
          coordinates: [parseFloat(lng || '0'), parseFloat(lat || '0')]
        },
        createdBy: user?.id
      };

      setToast({
        message: 'Campaign berhasil dibuat!',
        type: 'success'
      });

      setTimeout(() => {
        router.push('/campaign');
      }, 1500);
    } catch (error: any) {
      setToast({
        message: error.message || 'Gagal membuat campaign',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center px-4 py-4">
          <button onClick={() => router.back()} className="mr-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Buat Campaign</h1>
            <p className="text-sm text-gray-500">Ajak orang untuk bergotong royong</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Location Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Lokasi Campaign</h3>
              <p className="text-sm text-blue-700">{location}</p>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Detail Campaign</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Campaign <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: Bersih-Bersih Sungai Ciliwung"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={getMinDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maksimal Partisipan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              min="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Minimal 2 orang"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimal 2 orang partisipan</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi (Opsional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder:text-gray-600"
              placeholder="Tambahkan informasi tambahan tentang campaign..."
              rows={4}
            />
          </div>
        </div>

        {/* Organizer Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Penyelenggara</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipe Penyelenggara <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  organizerType: 'personal',
                  organizerName: user?.user_metadata?.full_name || ''
                })}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  formData.organizerType === 'personal'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${
                    formData.organizerType === 'personal' ? 'border-emerald-500' : 'border-gray-300'
                  }`}>
                    {formData.organizerType === 'personal' && (
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <svg className="w-5 h-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">Pribadi</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Campaign atas nama pribadi
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  organizerType: 'organization',
                  organizerName: ''
                })}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  formData.organizerType === 'organization'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${
                    formData.organizerType === 'organization' ? 'border-emerald-500' : 'border-gray-300'
                  }`}>
                    {formData.organizerType === 'organization' && (
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <svg className="w-5 h-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">Yayasan/Organisasi</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Campaign atas nama yayasan atau organisasi
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama {formData.organizerType === 'organization' ? 'Yayasan/Organisasi' : 'Penyelenggara'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.organizerName}
              onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={formData.organizerType === 'organization' ? 'Contoh: Yayasan Peduli Lingkungan' : 'Nama Anda'}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          loading={loading}
          fullWidth
          className="bg-[#16a34a] hover:bg-[#15803d]"
        >
          {loading ? 'Membuat Campaign...' : 'Buat Campaign'}
        </Button>
      </form>
    </div>
  );
}
