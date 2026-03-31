import { Input, Checkbox, Button } from '@/components';
import Link from 'next/link';

interface LoginFormProps {
  formData: {
    email: string;
    password: string;
  };
  errors: { [key: string]: string };
  loading: boolean;
  rememberMe: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  formData,
  errors,
  loading,
  rememberMe,
  onInputChange,
  onRememberMeChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Input
        type="email"
        name="email"
        value={formData.email}
        onChange={onInputChange}
        error={errors.email}
        placeholder="Masukkan email"
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        }
      />

      <Input
        type="password"
        name="password"
        value={formData.password}
        onChange={onInputChange}
        error={errors.password}
        placeholder="Masukkan password"
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />

      {/* Remember me and Forgot password */}
      <div className="flex items-center justify-between">
        <Checkbox
          checked={rememberMe}
          onChange={(e) => onRememberMeChange(e.target.checked)}
          label="Ingat saya"
        />
        <Link 
          href="/forgot-password" 
          className="text-sm text-[#16a34a] hover:text-[#15803d] font-medium"
        >
          Lupa password?
        </Link>
      </div>

      <Button 
        type="submit" 
        loading={loading}
        fullWidth
        className="mt-8"
      >
        Masuk
      </Button>
    </form>
  );
}
