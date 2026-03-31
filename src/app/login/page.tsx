'use client';

import React from 'react';
import Link from 'next/link';
import { PWAInstallPrompt } from '@/components';
import { useLogin } from './useLogin';
import LoginFormContainer from './LoginFormContainer';

export default function LoginPage() {
  const {
    formData,
    errors,
    loading,
    rememberMe,
    setRememberMe,
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
  } = useLogin();

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-all border border-gray-200"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Kembali</span>
        </Link>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:min-h-screen">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-28">
          <LoginFormContainer
            formData={formData}
            errors={errors}
            loading={loading}
            rememberMe={rememberMe}
            onInputChange={handleInputChange}
            onRememberMeChange={setRememberMe}
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
          />
        </div>

        {/* Right Section - Image */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <img 
              src="/images/logreg.png" 
              alt="Login illustration" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen bg-white flex items-center justify-center px-6 py-8">
        <LoginFormContainer
          formData={formData}
          errors={errors}
          loading={loading}
          rememberMe={rememberMe}
          onInputChange={handleInputChange}
          onRememberMeChange={setRememberMe}
          onSubmit={handleSubmit}
          onGoogleLogin={handleGoogleLogin}
        />
      </div>
      
      <PWAInstallPrompt />
    </div>
  );
}