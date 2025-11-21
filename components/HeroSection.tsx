import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  title: React.ReactNode
  subtitle?: string
  description?: string
  badge?: string
  primaryCTA?: { text: string; href: string }
  secondaryCTA?: { text: string; href: string }
  stats?: Array<{ value: string; label: string }>
  className?: string
}

export default function HeroSection({
  title,
  subtitle,
  description,
  badge,
  primaryCTA,
  secondaryCTA,
  stats,
  className,
}: HeroSectionProps) {
  return (
    <section className={cn(
      'container mx-auto px-4 sm:px-6 py-20 sm:py-32',
      className
    )}>
      <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-4">
          {badge && (
            <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-xs sm:text-sm font-medium text-sky-300">
              {badge}
            </div>
          )}
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            {title}
          </h1>
          
          {subtitle && (
            <div className="text-lg sm:text-xl bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent font-semibold">
              {subtitle}
            </div>
          )}
          
          {description && (
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {(primaryCTA || secondaryCTA) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {primaryCTA && (
              <Link href={primaryCTA.href}>
                <button className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-sky-500/20">
                  {primaryCTA.text} →
                </button>
              </Link>
            )}
            {secondaryCTA && (
              <Link href={secondaryCTA.href}>
                <button className="px-8 py-3 bg-slate-700/50 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 border border-slate-600">
                  {secondaryCTA.text}
                </button>
              </Link>
            )}
          </div>
        )}

        {stats && stats.length > 0 && (
          <div className={cn(
            'grid gap-8 pt-12 border-t border-slate-700/50',
            stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          )}>
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-bold text-sky-400">{stat.value}</div>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
