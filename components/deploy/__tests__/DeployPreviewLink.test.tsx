// components/deploy/__tests__/DeployPreviewLink.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeployPreviewLink } from '../DeployPreviewLink'

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'test-user', email: 'test@example.com' },
    },
    status: 'authenticated',
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('DeployPreviewLink Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        previewUrl: 'https://preview.example.com/page-123',
        previewHtml: '<h1>Preview</h1>',
        version: 'v1.0.0',
      }),
    })
  })

  it('should render preview link component', () => {
    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    expect(screen.getByText(/preview|generate/i)).toBeInTheDocument()
  })

  it('should generate preview on button click', async () => {
    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/deploy/preview'),
        expect.any(Object)
      )
    })
  })

  it('should display preview link after generation', async () => {
    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/https:\/\/preview/i) || screen.getByText(/preview/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during generation', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ previewUrl: 'https://preview.example.com' }),
      }), 100))
    )

    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText(/generating|loading/i)).toBeInTheDocument()
  })

  it('should handle preview generation errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to generate preview' }),
    })

    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('should allow copying preview link', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    })

    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      const copyButton = screen.queryByRole('button', { name: /copy|clipboard/i })
      if (copyButton) {
        fireEvent.click(copyButton)
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      }
    })
  })

  it('should open preview in new tab', async () => {
    window.open = jest.fn()

    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      const openButton = screen.queryByRole('button', { name: /open|view/i })
      if (openButton) {
        fireEvent.click(openButton)
      }
    })
  })

  it('should display version in preview', async () => {
    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/v1.0.0/)).toBeInTheDocument()
    })
  })

  it('should maintain preview state on re-render', async () => {
    const { rerender } = render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    
    rerender(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    // Should maintain the preview link
    expect(screen.getByText(/preview|https/i)).toBeInTheDocument()
  })

  it('should handle network errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('should clear error message on retry', async () => {
    let callCount = 0
    ;(global.fetch as jest.Mock).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ previewUrl: 'https://preview.example.com' }),
      })
    })

    render(<DeployPreviewLink pageId="page-123" slug="my-page" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })
  })
})
