interface LoginHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function LoginHeader({ 
  title = 'Selamat datang 👋', 
  subtitle = 'Masuk aplikasi dengan akun anda' 
}: LoginHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold text-gray-900">
        {title}
      </h1>
      <p className="text-gray-600">
        {subtitle}
      </p>
    </div>
  );
}
