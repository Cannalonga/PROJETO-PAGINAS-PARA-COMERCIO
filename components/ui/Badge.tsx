import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full'
    
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    }

    const variants = {
      primary: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
      secondary: 'bg-slate-700/50 text-slate-300 border border-slate-600/50',
      success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
      info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'
