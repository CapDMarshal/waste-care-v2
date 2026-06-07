import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmail, loginWithGoogle } from '@/lib/auth';
import { getErrorMessage } from '@/utils/errorMessages';

export function useRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName) newErrors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await registerWithEmail({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      });

      if (error) {
        setErrors({ email: getErrorMessage(error) });
        return;
      }

      if (data.user) {
        // Redirect to login page after successful registration
        router.push('/login');
      }
    } catch (error) {
      setErrors({ email: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrors({});
      const { error } = await loginWithGoogle();

      if (error) {
        setErrors({ email: getErrorMessage(error) });
      }
    } catch (error) {
      setErrors({ email: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
  };

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
  };
}
