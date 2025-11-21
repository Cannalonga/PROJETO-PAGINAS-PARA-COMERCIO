import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient'
  hover?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, ...props }, ref) => {
    const baseStyles = 'rounded-lg border transition duration-300'
    
    const variants = {
      default: 'bg-slate-800/50 border-slate-700/50',
      glass: 'bg-slate-900/40 backdrop-blur border-slate-700/30',
      gradient: 'bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50',
    }

    const hoverStyles = hover ? 'hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10' : ''

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], hoverStyles, className)}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'
