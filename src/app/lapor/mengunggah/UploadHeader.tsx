interface UploadHeaderProps {
  onBack: () => void;
}

export default function UploadHeader({ onBack }: UploadHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 mx-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-1 bg-orange-500 rounded"></div>
            <div className="flex-1 h-1 bg-orange-500 rounded"></div>
            <div className="flex-1 h-1 bg-orange-500 rounded"></div>
            <div className="flex-1 h-1 bg-orange-500 rounded"></div>
          </div>
        </div>
        
        <div className="w-8"></div>
      </div>
      
      {/* Step Info */}
      <div className="mt-3">
        <p className="text-sm text-orange-500 font-medium">LANGKAH 4/4</p>
      </div>
    </div>
  );
}
