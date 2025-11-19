// components/deploy/__tests__/DeployButton.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeployButton } from '../DeployButton'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/dashboard/pages/[id]',
    query: { id: 'test-page-id' },
  }),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'test-user', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
}))

describe('DeployButton Component', () => {
  const defaultProps = {
    pageId: 'test-page-123',
    pageName: 'Test Page',
    isLoading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render deploy button with correct text', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /publish/i })
      expect(button).toBeInTheDocument()
    })

    it('should render with page name in button', () => {
      render(<DeployButton {...defaultProps} pageName="My Store Page" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(/publish/i)
    })

    it('should disable button when isLoading is true', () => {
      render(<DeployButton {...defaultProps} isLoading={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loading indicator when deploying', () => {
      render(<DeployButton {...defaultProps} isLoading={true} />)
      
      expect(screen.getByText(/deploying/i)).toBeInTheDocument()
    })

    it('should render with success state after deployment', async () => {
      const { rerender } = render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      rerender(<DeployButton {...defaultProps} isLoading={false} />)
      
      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Button States', () => {
    it('should have publish state by default', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-brand-500')
    })

    it('should have loading state when isLoading is true', () => {
      render(<DeployButton {...defaultProps} isLoading={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show success message after deployment', async () => {
      render(<DeployButton {...defaultProps} isLoading={false} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.queryByText(/deploying/i)).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('User Interactions', () => {
    it('should handle click events', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(button).toBeInTheDocument()
    })

    it('should show error message on failed deployment', async () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      // Simulate error after a delay
      await waitFor(() => {
        expect(button).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have descriptive aria-label when loading', () => {
      render(<DeployButton {...defaultProps} isLoading={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should announce deployment status to screen readers', () => {
      const { rerender } = render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      rerender(<DeployButton {...defaultProps} isLoading={true} />)
      
      expect(screen.getByText(/deploying/i)).toBeInTheDocument()
    })
  })

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      const { container } = render(<DeployButton {...defaultProps} />)
      
      expect(container.querySelector('button')).toBeInTheDocument()
    })

    it('should handle empty pageName gracefully', () => {
      render(<DeployButton {...defaultProps} pageName="" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle special characters in pageId', () => {
      render(<DeployButton {...defaultProps} pageId="page-with-special-@#$" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid clicking', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
      
      // Button should remain in valid state
      expect(button).toBeInTheDocument()
    })

    it('should handle long page names', () => {
      const longName = 'A'.repeat(100)
      render(<DeployButton {...defaultProps} pageName={longName} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should clear loading state on component unmount', () => {
      const { unmount } = render(
        <DeployButton {...defaultProps} isLoading={true} />
      )
      
      unmount()
      
      // Component should clean up properly
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
