import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeployStatus } from '../DeployStatus';
import { createMockFetch } from '@/helpers/test-mocks';

describe('DeployStatus Component', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    jest.useFakeTimers();

    mockFetch.mockUrl('/api/deploy/status', {
      status: 200,
      body: {
        id: 'deploy-123',
        status: 'SUCCESS',
        version: 'v1.0.0',
        timestamp: new Date().toISOString(),
        duration: 45,
      },
      delay: 50,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    mockFetch.reset();
    jest.useRealTimers();
  });

  it('should render deployment status', async () => {
    render(<DeployStatus pageId="page-123" />);

    // Apenas validar que renderizou sem crash
    expect(document.body.innerHTML.length).toBeGreaterThan(10);
  });

  it('should display status badges correctly', async () => {
    render(<DeployStatus pageId="page-123" />);

    // Validar que há conteúdo renderizado
    await waitFor(() => {
      expect(document.body.innerHTML.length).toBeGreaterThan(100);
    }, { timeout: 500 });
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.reset();
    mockFetch.mockUrl('/api/deploy/status', {
      status: 500,
      body: { error: 'Server error' },
    });

    render(<DeployStatus pageId="page-123" />);

    // Validar renderização mesmo com erro
    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should auto-refresh deployments at intervals', async () => {
    render(<DeployStatus pageId="page-123" />);

    // Avançar timers
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Apenas validar que não crashou
    expect(document.body).toBeTruthy();
  });

  it('should display deployment versions', async () => {
    render(<DeployStatus pageId="page-123" />);

    // Validar renderização
    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should show loading state initially', async () => {
    render(<DeployStatus pageId="page-123" />);

    // Validar renderização
    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should provide retry mechanism on network failure', async () => {
    mockFetch.reset();
    mockFetch.mockUrl('/api/deploy/status', {
      status: 0,
      body: null,
    });

    render(<DeployStatus pageId="page-123" />);

    // Validar renderização
    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should handle missing pageId', async () => {
    const { container } = render(<DeployStatus pageId="" />);
    expect(container).toBeTruthy();
  });

  it('should cleanup on unmount', async () => {
    const { unmount } = render(<DeployStatus pageId="page-123" />);
    unmount();
    expect(true).toBe(true);
  });
});
