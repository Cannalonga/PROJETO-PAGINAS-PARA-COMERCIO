/**
 * useSeoData - Fetch + cache SEO data with auto-refresh
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface SeoDataState {
  data: any | null;
  isLoading: boolean;
  error: string | null;
}

interface UseSeoDataOptions {
  autoRefresh?: boolean;
  autoRefreshInterval?: number;
}

export function useSeoData(pageId: string, options: UseSeoDataOptions = {}) {
  const { autoRefresh = true, autoRefreshInterval = 30000 } = options;

  const [state, setState] = useState<SeoDataState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSeoData = useCallback(async () => {
    try {
      // Check cache first
      const cached = cacheRef.current.get(pageId);
      if (cached && Date.now() - cached.timestamp < autoRefreshInterval) {
        setState({
          data: cached.data,
          isLoading: false,
          error: null,
        });
        return cached.data;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`/api/seo/${pageId}/summary`);

      if (!response.ok) {
        throw new Error(`SEO data fetch failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the result
      cacheRef.current.set(pageId, {
        data,
        timestamp: Date.now(),
      });

      setState({
        data,
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
      });

      return null;
    }
  }, [pageId, autoRefreshInterval]);

  // Initial fetch
  useEffect(() => {
    fetchSeoData();
  }, [pageId, fetchSeoData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(fetchSeoData, autoRefreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, autoRefreshInterval, fetchSeoData]);

  const refetch = useCallback(() => {
    // Clear cache for this pageId
    cacheRef.current.delete(pageId);
    return fetchSeoData();
  }, [pageId, fetchSeoData]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  };
}
