'use client'

import React, { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center'

  const sizeStyles = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-12 px-8 text-lg',
  }

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-[#1B64D3] shadow-md hover:shadow-lg active:scale-95',
    secondary: 'bg-secondary text-white hover:bg-[#051a2e] shadow-md hover:shadow-lg active:scale-95',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-blue-50 active:scale-95',
    ghost: 'text-primary hover:bg-blue-50 active:scale-95',
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
