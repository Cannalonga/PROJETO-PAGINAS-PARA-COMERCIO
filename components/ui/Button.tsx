import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg hover:shadow-xl active:scale-95 focus-visible:ring-sky-500',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95 focus-visible:ring-slate-300',
        outline: 'border-2 border-sky-500 text-sky-500 hover:bg-sky-50 active:scale-95 focus-visible:ring-sky-500',
        ghost: 'text-slate-700 hover:bg-slate-100 active:scale-95',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-xl active:scale-95 focus-visible:ring-emerald-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl active:scale-95 focus-visible:ring-red-500',
      },
      size: {
        xs: 'px-3 py-1.5 text-xs',
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={isLoading || disabled}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="animate-spin">⏳</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
)

Button.displayName = 'Button'

export { Button, buttonVariants }
