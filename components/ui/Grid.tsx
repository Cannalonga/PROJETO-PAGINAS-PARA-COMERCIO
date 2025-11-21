import React from 'react'
import { cn } from '@/lib/utils'

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg'
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 3, gap = 'md', ...props }, ref) => {
    const gaps = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          `grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols}`,
          gaps[gap],
          className
        )}
        {...props}
      />
    )
  }
)

Grid.displayName = 'Grid'
