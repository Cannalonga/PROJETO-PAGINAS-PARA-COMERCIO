// components/deploy/DeployTimeline.tsx
"use client";

import { useEffect, useState } from "react";

interface DeploymentEvent {
  id: string;
  timestamp: Date;
  status: string;
  message: string;
  icon: string;
}

interface DeployTimelineProps {
  pageId: string;
  maxEvents?: number;
}

export function DeployTimeline({ pageId, maxEvents = 8 }: DeployTimelineProps) {
  const [events, setEvents] = useState<DeploymentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadEvents() {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/deploy/status?pageId=${pageId}&limit=${maxEvents}`);
      const data = await res.json();

      if (res.ok && data.deployments) {
        const statusIcons: Record<string, string> = {
          PENDING: "⏳",
          RUNNING: "🔄",
          SUCCESS: "✅",
          FAILED: "❌",
          ROLLED_BACK: "↩️",
        };
        const mappedEvents: DeploymentEvent[] = data.deployments.map(
          (dep: any) => ({
            id: dep.id,
            timestamp: new Date(dep.startedAt),
            status: dep.status,
            message: dep.errorMessage || `Versão ${dep.version}`,
            icon: statusIcons[dep.status] || "❓",
          })
        );
        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error("Failed to load deployment timeline", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 10000); // Auto-refresh a cada 10s
    return () => clearInterval(interval);
  }, [pageId]);

  if (isLoading && events.length === 0) {
    return <div className="text-slate-400 text-sm">Carregando timeline...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Timeline de Publicações</h3>

      {events.length === 0 ? (
        <p className="text-slate-400 text-sm">Nenhum evento registrado</p>
      ) : (
        <div className="space-y-3">
          {events.map((event, idx) => (
            <div key={event.id} className="flex gap-3">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div className="text-2xl">{event.icon}</div>
                {idx < events.length - 1 && (
                  <div className="h-8 w-1 bg-slate-200 my-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <p className="text-xs text-slate-500">
                  {event.timestamp.toLocaleString("pt-BR")}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {event.status}
                </p>
                <p className="text-xs text-slate-600 mt-1">{event.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
