'use client';

import React from 'react';

interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export default function SubmitButton({
  children,
  isLoading = false,
  loadingText,
  disabled = false,
  onClick,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      onClick={onClick}
      className="
        w-full flex justify-center items-center py-3 px-4 
        bg-[#8B5CF6] hover:bg-[#7c3aed] text-white 
        font-bold rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.25)] 
        hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)]
        focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:ring-offset-2
        dark:focus:ring-offset-slate-950
        transition-all duration-300 transform active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        text-sm tracking-wide
      "
    >
      {isLoading ? (
        <>
          {/* Spinner icon */}
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
