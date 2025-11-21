import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = 'xl', ...props }, ref) => {
    const maxWidths = {
      sm: 'max-w-2xl',
      md: 'max-w-3xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      '2xl': 'max-w-7xl',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto px-4 sm:px-6',
          maxWidths[maxWidth],
          className
        )}
        {...props}
      />
    )
  }
)

Container.displayName = 'Container'
