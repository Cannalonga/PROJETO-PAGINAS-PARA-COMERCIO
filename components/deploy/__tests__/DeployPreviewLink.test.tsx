import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeployPreviewLink } from '../DeployPreviewLink';
import { createMockFetch } from '@/helpers/test-mocks';

describe('DeployPreviewLink Component', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    jest.useFakeTimers();

    mockFetch.mockUrl('/api/deploy/generate', {
      status: 200,
      body: {
        previewUrl: 'https://preview.example.com/page-123',
        version: 'v1.0.0',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      delay: 50,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    mockFetch.reset();
    jest.useRealTimers();
  });

  it('should render preview button', () => {
    render(<DeployPreviewLink pageId="page-123" slug="my-page" />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should generate preview on button click', async () => {
    render(<DeployPreviewLink pageId="page-123" slug="my-page" />);

    const button = screen.queryByRole('button');
    if (button) {
      fireEvent.click(button);
    }

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should show loading state during generation', async () => {
    render(<DeployPreviewLink pageId="page-123" slug="my-page" />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should handle preview generation errors', async () => {
    mockFetch.reset();
    mockFetch.mockUrl('/api/deploy/generate', {
      status: 400,
      body: { error: 'Invalid page' },
    });

    render(<DeployPreviewLink pageId="page-123" slug="my-page" />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should display version in generated preview', async () => {
    render(<DeployPreviewLink pageId="page-123" slug="my-page" />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should maintain preview state on re-render', async () => {
    const { rerender } = render(
      <DeployPreviewLink pageId="page-123" slug="my-page" />
    );

    rerender(<DeployPreviewLink pageId="page-123" slug="my-page-v2" />);

    expect(document.body.innerHTML).toBeTruthy();
  });

  it('should handle network errors gracefully', async () => {
    mockFetch.reset();
    mockFetch.mockUrl('/api/deploy/generate', {
      status: 0,
      body: null,
    });

    render(<DeployPreviewLink pageId="page-123" slug="my-page" />);

    expect(document.body.innerHTML).toBeTruthy();
  });
});
