export default function SuccessMessage() {
  return (
    <div className="text-center space-y-3">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900">
        Laporan berhasil dikirim!
      </h1>
      <p className="text-gray-600">
        Terima kasih telah berkontribusi menjaga lingkungan. AI kami telah menganalisis foto dan mengklasifikasikan sampah secara otomatis.
      </p>
    </div>
  );
}
