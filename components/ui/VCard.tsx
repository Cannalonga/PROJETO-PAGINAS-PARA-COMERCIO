'use client'

import React, { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'light' | 'dark' | 'premium'
}

export function VCard({ variant = 'light', className = '', children, ...props }: CardProps) {
  const variantStyles = {
    light: 'bg-white border border-borderLight shadow-sm hover:shadow-md transition-shadow',
    dark: 'bg-secondary text-white border border-secondary/20 shadow-md',
    premium: 'bg-gradient-to-br from-primary/5 to-fast/5 border border-primary/20 shadow-sm',
  }

  return (
    <div
      className={`rounded-2xl p-6 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
