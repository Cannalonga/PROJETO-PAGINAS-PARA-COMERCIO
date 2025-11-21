'use client'

import React, { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function VInput({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-textDark mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full h-11 px-4 rounded-xl
          border border-borderLight
          text-textDark placeholder-textLight
          focus:border-primary focus:ring-1 focus:ring-primary
          outline-none transition-all
          ${error ? 'border-error focus:border-error' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  )
}
