import Image from 'next/image';

interface PhotoGridProps {
  photos: string[];
  onRemovePhoto: (index: number) => void;
  onAddMorePhotos: () => void;
  loading: boolean;
}

export default function PhotoGrid({ photos, onRemovePhoto, onAddMorePhotos, loading }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <button
          onClick={onAddMorePhotos}
          disabled={loading}
          className="w-full aspect-video h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-50 transition-all"
        >
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="mt-4 text-lg font-medium text-gray-700">Tambah foto</span>
          <span className="mt-1 text-sm text-gray-500">Klik untuk memilih foto</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {photos.map((photo, index) => (
        <div key={index} className="relative">
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden w-full h-64">
            <Image
              src={photo}
              alt={`Preview foto ${index + 1}`}
              width={500}
              height={500}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <button
            onClick={() => onRemovePhoto(index)}
            className="absolute top-3 right-3 w-8 h-8 bg-red-500 bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}

      {/* Add more photos button */}
      <button
        onClick={onAddMorePhotos}
        disabled={loading}
        className="w-full aspect-video h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-50 transition-all"
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="mt-2 text-sm text-gray-500">Tambah foto lagi</span>
      </button>
    </div>
  );
}
