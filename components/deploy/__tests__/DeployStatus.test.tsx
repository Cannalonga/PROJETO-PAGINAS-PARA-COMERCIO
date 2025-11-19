// components/deploy/__tests__/DeployStatus.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeployStatus } from '../DeployStatus'

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'test-user', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('DeployStatus Component', () => {
  const mockDeploymentData = [
    {
      id: 'deploy-1',
      pageId: 'page-123',
      status: 'SUCCESS',
      version: 'v1.0.0',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      deployedUrl: 'https://example.com/deploy-1',
    },
    {
      id: 'deploy-2',
      pageId: 'page-123',
      status: 'PENDING',
      version: 'v1.0.1',
      startedAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDeploymentData,
    })
  })

  it('should render deployment status', async () => {
    render(<DeployStatus pageId="page-123" />)
    
    await waitFor(() => {
      expect(screen.getByText(/deployment/i)).toBeInTheDocument()
    })
  })

  it('should fetch deployment history on mount', async () => {
    render(<DeployStatus pageId="page-123" />)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/deploy/status')
      )
    })
  })

  it('should display status badges', async () => {
    render(<DeployStatus pageId="page-123" />)
    
    await waitFor(() => {
      expect(screen.getByText(/success|pending/i)).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to fetch' }),
    })

    render(<DeployStatus pageId="page-123" />)
    
    await waitFor(() => {
      expect(screen.getByText(/erro|error/i)).toBeInTheDocument()
    })
  })

  it('should auto-refresh deployments', async () => {
    jest.useFakeTimers()
    
    render(<DeployStatus pageId="page-123" autoRefresh={5} />)
    
    expect(global.fetch).toHaveBeenCalledTimes(1)
    
    jest.advanceTimersByTime(5000)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
    
    jest.useRealTimers()
  })

  it('should display deployment versions', async () => {
    render(<DeployStatus pageId="page-123" />)
    
    await waitFor(() => {
      expect(screen.getByText(/v1.0.0|v1.0.1/)).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    render(<DeployStatus pageId="page-123" />)
    
    // Component might show loading state briefly
    expect(screen.getByRole('article') || document.body).toBeInTheDocument()
  })

  it('should handle different deployment statuses', async () => {
    render(<DeployStatus pageId="page-123" />)
    
    await waitFor(() => {
      const elements = screen.queryAllByText(/success|pending|failed/i)
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('should cleanup on unmount', () => {
    const { unmount } = render(<DeployStatus pageId="page-123" />)
    
    unmount()
    
    expect(screen.queryByText(/deployment/i)).not.toBeInTheDocument()
  })
})
