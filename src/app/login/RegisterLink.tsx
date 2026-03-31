import Link from 'next/link';

export default function RegisterLink() {
  return (
    <div className="text-center">
      <span className="text-gray-600">Belum memiliki akun? </span>
      <Link
        href="/register"
        className="text-[#16a34a] hover:text-[#15803d] font-medium underline"
      >
        Daftar
      </Link>
    </div>
  );
}
