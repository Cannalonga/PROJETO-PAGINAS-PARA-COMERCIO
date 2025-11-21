import React from 'react'
import { cn } from '@/lib/utils'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  variant?: 'default' | 'gradient' | 'dark'
  py?: 'sm' | 'md' | 'lg'
}

export default function Section({
  className,
  children,
  id,
  variant = 'default',
  py = 'lg',
  ...props
}: SectionProps) {
  const variants = {
    default: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
    gradient: 'bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-sky-500/10',
    dark: 'bg-slate-900/50',
  }

  const paddings = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
  }

  return (
    <section
      id={id}
      className={cn(
        variants[variant],
        paddings[py],
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}
