// components/deploy/DeployTimeline.tsx
"use client";

import { useEffect, useState } from "react";

interface DeployTimelineProps {
  pageId: string;
  limit?: number;
}

interface DeploymentHistoryItem {
  id: string;
  status: string;
  version: string;
  startedAt: string;
  finishedAt?: string;
  deployedUrl?: string;
}

export function DeployTimeline({
  pageId,
  limit = 10,
}: DeployTimelineProps) {
  const [items, setItems] = useState<DeploymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/deploy/history?pageId=${encodeURIComponent(pageId)}&limit=${limit}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao carregar histórico");
        return;
      }

      setItems(data.deployments || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [pageId, limit]);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-slate-300" />
          Carregando histórico...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-700/40 bg-red-950/40 p-4 text-xs text-red-200">
        <div className="font-semibold">Histórico de Deploys</div>
        <div className="mt-1">{error}</div>
        <button
          onClick={fetchHistory}
          className="mt-2 text-[11px] text-red-300 hover:text-red-200 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-300">
        Nenhum histórico de deploy encontrado.
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "✅";
      case "FAILED":
        return "❌";
      case "RUNNING":
        return "⏳";
      case "ROLLED_BACK":
        return "↩️";
      default:
        return "◯";
    }
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-xs text-slate-200 space-y-3">
      <div className="font-semibold">Histórico de Deploys</div>

      <ol className="space-y-2">
        {items.map((item, index) => {
          const statusColor =
            item.status === "SUCCESS"
              ? "bg-emerald-600/20 border-emerald-600/40"
              : item.status === "FAILED"
                ? "bg-red-600/20 border-red-600/40"
                : item.status === "ROLLED_BACK"
                  ? "bg-yellow-600/20 border-yellow-600/40"
                  : "bg-slate-600/20 border-slate-600/40";

          return (
            <li key={item.id} className="flex gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={`h-2 w-2 rounded-full ${
                    item.status === "SUCCESS"
                      ? "bg-emerald-400"
                      : item.status === "FAILED"
                        ? "bg-red-400"
                        : item.status === "ROLLED_BACK"
                          ? "bg-yellow-400"
                          : "bg-slate-400"
                  }`}
                />
                {index < items.length - 1 && (
                  <div className="h-6 w-px bg-slate-700" />
                )}
              </div>

              <div className={`flex-1 rounded-md border p-2 ${statusColor}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">
                    {getStatusIcon(item.status)} {item.status}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.version}
                  </div>
                </div>

                <div className="mt-1 text-[11px] text-slate-300">
                  <div>
                    Iniciado:{" "}
                    {new Date(item.startedAt).toLocaleString("pt-BR", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {item.finishedAt && (
                    <div>
                      Finalizado:{" "}
                      {new Date(item.finishedAt).toLocaleString("pt-BR", {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>

                {item.deployedUrl && (
                  <div className="mt-2">
                    <a
                      href={item.deployedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-300 hover:text-sky-200 underline"
                    >
                      🔗 Ver página
                    </a>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <button
        onClick={fetchHistory}
        className="mt-2 text-[11px] text-sky-300 hover:text-sky-200 underline"
      >
        Atualizar histórico
      </button>
    </div>
  );
}
