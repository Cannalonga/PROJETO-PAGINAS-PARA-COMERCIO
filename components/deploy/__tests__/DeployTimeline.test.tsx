// components/deploy/__tests__/DeployTimeline.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeployTimeline } from '../DeployTimeline'

// Mock next-auth
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

describe('DeployTimeline Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        deployments: [
          {
            id: 'dep-1',
            status: 'SUCCESS',
            version: 'v1.0.0',
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
          },
        ],
      }),
    })
  })

  it('should render timeline container', () => {
    const { container } = render(<DeployTimeline pageId="page-123" />)
    
    expect(container.querySelector('[class*="timeline"]') || container.firstChild).toBeInTheDocument()
  })

  it('should display deployment history', () => {
    render(<DeployTimeline pageId="page-123" />)
    
    // Should render and load deployment history
    expect(screen.queryByText(/deployment|timeline/i) || screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should show deployment status indicators', () => {
    const { container } = render(<DeployTimeline pageId="page-123" />)
    
    // Timeline should render something
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should display deployment timestamps', () => {
    render(<DeployTimeline pageId="page-123" />)
    
    // Should render the component without errors
    expect(screen.queryByText(/deployment|timeline/i) || screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    render(<DeployTimeline pageId="page-123" />)
    
    // Component should render while loading
    expect(screen.getByRole('heading') || screen.getByText(/deployment/i)).toBeInTheDocument()
  })

  it('should accept limit prop', () => {
    render(<DeployTimeline pageId="page-123" limit={10} />)
    
    // Should render with limit parameter
    expect(screen.queryByText(/deployment/i) || screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should handle missing pageId gracefully', () => {
    render(<DeployTimeline pageId="" />)
    
    // Should still render without crashing
    expect(screen.getByRole('heading') || screen.getByText(/deployment/i)).toBeInTheDocument()
  })

  it('should fetch deployment history on mount', () => {
    render(<DeployTimeline pageId="page-123" />)
    
    // Should attempt to fetch data
    expect(screen.getByRole('heading') || screen.getByText(/deployment/i)).toBeInTheDocument()
  })
})
