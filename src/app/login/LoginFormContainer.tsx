import { GoogleButton } from '@/components';
import LoginHeader from './LoginHeader';
import LoginForm from './LoginForm';
import FormDivider from './FormDivider';
import RegisterLink from './RegisterLink';

interface LoginFormContainerProps {
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
  onGoogleLogin: () => void;
}

export default function LoginFormContainer({
  formData,
  errors,
  loading,
  rememberMe,
  onInputChange,
  onRememberMeChange,
  onSubmit,
  onGoogleLogin,
}: LoginFormContainerProps) {
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <LoginHeader />

      {/* Google Sign In */}
      <GoogleButton 
        onClick={onGoogleLogin}
        className="mb-6"
      />

      {/* Divider */}
      <FormDivider />

      {/* Login Form */}
      <LoginForm
        formData={formData}
        errors={errors}
        loading={loading}
        rememberMe={rememberMe}
        onInputChange={onInputChange}
        onRememberMeChange={onRememberMeChange}
        onSubmit={onSubmit}
      />

      {/* Register Link */}
      <RegisterLink />
    </div>
  );
}
