import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses = `
    font-light rounded-xl transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
   
  `;

  const variantClasses = {
    primary: `
      bg-emerald-700 hover:bg-emerald-800
      text-white 
      focus:ring-emerald-500 
      shadow-sm
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 
      text-gray-900 
      focus:ring-gray-500
    `,
    outline: `
      border border-gray-300 hover:bg-gray-50 
      text-gray-700 
      focus:ring-gray-500
      bg-white
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-2.5 text-sm min-h-[40px]',
    md: 'px-4 py-3.5 text-base min-h-[52px]',
    lg: 'px-6 py-4.5 text-lg min-h-[60px]'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;