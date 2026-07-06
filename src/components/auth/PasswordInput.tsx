'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  autoComplete,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShow = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="space-y-1.5 w-full relative group">
      <label htmlFor={name} className="text-xs font-bold text-slate-700 dark:text-slate-350 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {/* Lock Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className={`h-4 w-4 transition-colors ${
            error 
              ? 'text-red-400' 
              : 'text-slate-400 dark:text-slate-550 group-focus-within:text-[#8B5CF6]'
          }`} />
        </div>

        {/* Input field */}
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full bg-white dark:bg-slate-900/50 
            border ${error ? 'border-red-500 dark:border-red-500/80 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20'} 
            rounded-xl pl-11 pr-11 py-3 
            text-slate-900 dark:text-white 
            placeholder:text-slate-400 dark:placeholder:text-slate-500 
            focus:outline-none focus:ring-2 
            transition-all font-medium text-sm
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />

        {/* Show/Hide eye button */}
        <button
          type="button"
          onClick={toggleShow}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {error && (
        <span className="text-[11px] font-semibold text-red-500 dark:text-red-400 ml-1 block animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
}
