import { DetailItem } from '@/components';

export default function PhotoInstructions() {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Tambahkan foto sampah
      </h1>

      {/* Camera Image */}
      <div className="flex justify-center">
        <img 
          src="/images/lapor-foto.png" 
          alt="Add photo" 
          className="w-48 h-48 object-contain"
        />
      </div>

      {/* Description */}
      <div className="space-y-3">
        <DetailItem
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          iconBgColor="bg-gray-100"
          iconColor="text-gray-500"
          title="Pastikan gambar jelas"
          description="Ai kami akan menganalisa foto untuk validasi otomatis"
        />
      </div>
    </div>
  );
}
