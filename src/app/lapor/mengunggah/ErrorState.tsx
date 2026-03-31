interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

export default function ErrorState({ error, onRetry, onBack }: ErrorStateProps) {
  return (
    <div className="text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Gagal mengunggah
        </h1>
        <p className="text-gray-600">
          {error}
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Coba lagi
        </button>
        <button
          onClick={onBack}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
