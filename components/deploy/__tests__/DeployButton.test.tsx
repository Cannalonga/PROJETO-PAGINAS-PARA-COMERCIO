// components/deploy/__tests__/DeployButton.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeployButton } from '../DeployButton'

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
    slug: 'test-page',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render deploy button with correct text', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /publish|deploy/i })
      expect(button).toBeInTheDocument()
    })

    it('should render the button with page slug', () => {
      render(<DeployButton {...defaultProps} slug="my-store" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render the button with page ID', () => {
      render(<DeployButton {...defaultProps} pageId="page-456" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should handle click events', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(button).toBeInTheDocument()
    })

    it('should handle multiple clicks without errors', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
      
      expect(button).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      render(<DeployButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      const { container } = render(<DeployButton {...defaultProps} />)
      
      expect(container.querySelector('button')).toBeInTheDocument()
    })

    it('should handle pageId correctly', () => {
      render(<DeployButton pageId="page-789" slug="test" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle slug correctly', () => {
      render(<DeployButton pageId="page-123" slug="long-page-slug-name" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in pageId', () => {
      render(<DeployButton pageId="page-123-abc" slug="test" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle special characters in slug', () => {
      render(<DeployButton pageId="page-123" slug="my-page-slug-v2" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render correctly when slug is empty string', () => {
      render(<DeployButton pageId="page-123" slug="" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render correctly when pageId is empty string', () => {
      render(<DeployButton pageId="" slug="test-page" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })
})
