'use client';

import { useEffect, useRef } from 'react';

interface AnalyticsTrackerProps {
    tenantId: string;
}

export function AnalyticsTracker({ tenantId }: AnalyticsTrackerProps) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;

        const trackView = async () => {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tenantId,
                        eventType: 'PAGE_VIEW',
                    }),
                });
            } catch (err) {
                // Silently fail
                console.error('Failed to track view', err);
            }
        };

        trackView();
    }, [tenantId]);

    return null; // Componente invisível
}
