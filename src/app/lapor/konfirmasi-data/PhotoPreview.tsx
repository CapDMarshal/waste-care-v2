interface PhotoPreviewProps {
  photos: string[];
}

export default function PhotoPreview({ photos }: PhotoPreviewProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          {photos.length} Foto diunggah
        </span>
        <div className="flex -space-x-2">
          {photos.slice(0, 3).map((photo, index) => (
            <div 
              key={index}
              className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden"
              style={{ 
                backgroundImage: `url(data:image/jpeg;base64,${photo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
          ))}
          {photos.length > 3 && (
            <div className="w-10 h-10 bg-gray-300 rounded-lg border-2 border-white flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">+{photos.length - 3}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
