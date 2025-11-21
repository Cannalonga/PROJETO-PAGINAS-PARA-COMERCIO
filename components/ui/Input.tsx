import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, type = 'text', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-2 rounded-lg',
            'bg-slate-800/50 border border-slate-700/50',
            'text-white placeholder-slate-500',
            'focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30',
            'transition duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        {helper && !error && (
          <p className="text-xs text-slate-400">{helper}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
