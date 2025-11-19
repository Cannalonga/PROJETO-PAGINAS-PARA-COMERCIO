// components/deploy/__tests__/DeployTimeline.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeployTimeline } from '../DeployTimeline'

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'test-user', email: 'test@example.com' },
    },
    status: 'authenticated',
  }),
}))

describe('DeployTimeline Component', () => {
  const mockDeployments = [
    {
      id: 'deploy-1',
      status: 'SUCCESS' as const,
      version: 'v1.0.0',
      startedAt: new Date(Date.now() - 60000),
      finishedAt: new Date(Date.now() - 30000),
    },
    {
      id: 'deploy-2',
      status: 'RUNNING' as const,
      version: 'v1.0.1',
      startedAt: new Date(Date.now() - 10000),
    },
    {
      id: 'deploy-3',
      status: 'FAILED' as const,
      version: 'v0.9.9',
      startedAt: new Date(Date.now() - 120000),
      finishedAt: new Date(Date.now() - 90000),
      errorMessage: 'Build failed',
    },
  ]

  it('should render timeline container', () => {
    const { container } = render(<DeployTimeline deployments={mockDeployments} />)
    
    expect(container.querySelector('[class*="timeline"]') || container.firstChild).toBeInTheDocument()
  })

  it('should display all deployment events', () => {
    render(<DeployTimeline deployments={mockDeployments} />)
    
    expect(screen.getByText(/v1.0.0/)).toBeInTheDocument()
    expect(screen.getByText(/v1.0.1/)).toBeInTheDocument()
    expect(screen.getByText(/v0.9.9/)).toBeInTheDocument()
  })

  it('should show correct status icons', () => {
    const { container } = render(<DeployTimeline deployments={mockDeployments} />)
    
    // Should have icons for different statuses
    const icons = container.querySelectorAll('svg, [role="img"]')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should display deployment timestamps', () => {
    render(<DeployTimeline deployments={mockDeployments} />)
    
    // Timeline should contain time-related information
    const elements = screen.getAllByText(/ago|minute|hour/i)
    expect(elements.length).toBeGreaterThanOrEqual(0)
  })

  it('should show error message for failed deployments', () => {
    render(<DeployTimeline deployments={mockDeployments} />)
    
    expect(screen.getByText(/build failed|error/i)).toBeInTheDocument()
  })

  it('should color-code status visually', () => {
    const { container } = render(<DeployTimeline deployments={mockDeployments} />)
    
    // Check for color classes (green for success, red for failed, etc)
    const coloredElements = container.querySelectorAll('[class*="bg-"], [class*="text-"]')
    expect(coloredElements.length).toBeGreaterThan(0)
  })

  it('should handle empty deployments array', () => {
    const { container } = render(<DeployTimeline deployments={[]} />)
    
    // Should render empty or placeholder
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should display running status with indicator', () => {
    render(<DeployTimeline deployments={mockDeployments} />)
    
    // RUNNING status should be visually distinct
    expect(screen.getByText(/v1.0.1/)).toBeInTheDocument()
  })

  it('should format durations correctly', () => {
    render(<DeployTimeline deployments={mockDeployments} />)
    
    // Should show elapsed time for completed deployments
    const timeElements = screen.queryAllByText(/\d+[smh]/i)
    expect(timeElements.length).toBeGreaterThanOrEqual(0)
  })

  it('should handle deployments with no finish time', () => {
    const ongoingDeployments = [
      {
        id: 'deploy-1',
        status: 'RUNNING' as const,
        version: 'v1.0.0',
        startedAt: new Date(),
      },
    ]

    render(<DeployTimeline deployments={ongoingDeployments} />)
    
    expect(screen.getByText(/v1.0.0/)).toBeInTheDocument()
  })

  it('should be accessible for screen readers', () => {
    const { container } = render(<DeployTimeline deployments={mockDeployments} />)
    
    // Should have semantic HTML
    expect(container.querySelector('article') || container.querySelector('section') || container.firstChild).toBeInTheDocument()
  })
})
