'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormInputProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: LucideIcon;
  required?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
}

export default function FormInput({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  options = [],
  disabled = false,
  autoComplete,
  maxLength,
  pattern,
}: FormInputProps) {
  const isSelect = type === 'select';

  const inputClasses = `
    w-full bg-white dark:bg-slate-900/50 
    border ${error ? 'border-red-500 dark:border-red-500/80 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20'} 
    rounded-xl ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 
    text-slate-900 dark:text-white 
    placeholder:text-slate-400 dark:placeholder:text-slate-500 
    focus:outline-none focus:ring-2 
    transition-all font-medium text-sm
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className="space-y-1.5 w-full relative group">
      <label htmlFor={name} className="text-xs font-bold text-slate-700 dark:text-slate-350 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className={`h-4 w-4 transition-colors ${
              error 
                ? 'text-red-400' 
                : 'text-slate-400 dark:text-slate-550 group-focus-within:text-[#8B5CF6]'
            }`} />
          </div>
        )}

        {isSelect ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            maxLength={maxLength}
            pattern={pattern}
            className={inputClasses}
          />
        )}
      </div>

      {error && (
        <span className="text-[11px] font-semibold text-red-500 dark:text-red-400 ml-1 block animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
}
