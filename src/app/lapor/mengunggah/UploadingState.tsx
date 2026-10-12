interface UploadingStateProps {
  uploading: boolean;
  progress: number;
}

export default function UploadingState({ uploading, progress }: UploadingStateProps) {
  return (
    <div className="text-center space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {uploading ? 'Mulai mengunggah...' : 'Berhasil diunggah!'}
      </h1>

      {/* Upload Animation Image */}
      <div className="flex justify-center pt-8">
        <div className="relative">
          {uploading ? (
            <img 
              src="/images/lapor-uploading.png" 
              alt="Uploading" 
              className="w-64 h-64 object-contain animate-bounce"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center">
              <div className="w-32 h-32 bg-green-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {progress}% selesai
          </p>
        </div>
      )}
    </div>
  );
}
