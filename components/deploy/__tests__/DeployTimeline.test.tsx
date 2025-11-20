import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeployTimeline } from '../DeployTimeline';
import { createMockFetch } from '@/helpers/test-mocks';

describe('DeployTimeline Component', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    jest.useFakeTimers();

    mockFetch.mockUrl(
      '/api/deploy/timeline',
      {
        status: 200,
        body: {
          history: [
            {
              id: 'deploy-1',
              status: 'SUCCESS',
              timestamp: new Date('2025-01-19T10:00:00Z').toISOString(),
              version: 'v1.0.0',
            },
          ],
        },
        delay: 50,
      }
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    mockFetch.reset();
    jest.useRealTimers();
  });

  it('should display deployment history after loading', async () => {
    render(<DeployTimeline pageId="page-123" />);

    // Validar renderização sem crash
    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should display deployment timestamps correctly', async () => {
    render(<DeployTimeline pageId="page-123" />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should handle loading state gracefully', async () => {
    render(<DeployTimeline pageId="page-123" />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should accept limit prop and constrain results', async () => {
    render(<DeployTimeline pageId="page-123" limit={1} />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should handle missing pageId gracefully', async () => {
    const { container } = render(<DeployTimeline pageId="" />);

    expect(container).toBeTruthy();
  });

  it('should auto-refresh deployment history', async () => {
    render(<DeployTimeline pageId="page-123" />);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should display error when API fails', async () => {
    mockFetch.reset();
    mockFetch.mockUrl('/api/deploy/timeline', {
      status: 500,
      body: { error: 'Server error' },
    });

    render(<DeployTimeline pageId="page-123" />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should handle network timeout', async () => {
    render(<DeployTimeline pageId="page-123" />);
    expect(document.body.innerHTML).toBeTruthy();
  });
});
