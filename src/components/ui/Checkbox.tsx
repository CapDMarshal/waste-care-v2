import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          className={`
            h-5 w-5 rounded border-2 border-gray-300
            text-[#16a34a] 
            focus:ring-2 focus:ring-green-500 focus:ring-offset-0
            focus:outline-none
            transition-colors duration-200
            ${error ? 'border-red-300' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      <div className="flex-1">
        <label className="text-sm text-gray-600 leading-5">
          {label}
        </label>
        {error && (
          <p className="text-sm text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;