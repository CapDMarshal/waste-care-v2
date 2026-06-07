'use client';

import React from 'react';
import Link from 'next/link';
import { PWAInstallPrompt, Input, Button, GoogleButton } from '@/components';
import { useRegister } from './useRegister';
import FormDivider from '../login/FormDivider';

export default function RegisterPage() {
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
  } = useRegister();

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

      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Mobile & Desktop Form Layout */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-20 xl:px-28">
          <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Daftar Akun Baru</h2>
              <p className="text-gray-600">Mari bergabung dan jaga kebersihan bersama WasteCare</p>
            </div>

            <GoogleButton onClick={handleGoogleLogin} className="mb-6" />

            <FormDivider />

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                placeholder="Nama Lengkap"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Masukkan password"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="Konfirmasi password"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Button type="submit" loading={loading} fullWidth className="mt-8">
                Daftar
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-gray-600">Sudah memiliki akun? </span>
              <Link href="/login" className="text-[#16a34a] hover:text-[#15803d] font-medium underline">
                Masuk
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section - Image (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <img src="/images/logreg.png" alt="Register illustration" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      
      <PWAInstallPrompt />
    </div>
  );
}
