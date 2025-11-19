// components/deploy/DeployStatus.tsx
"use client";

import { useEffect, useState } from "react";

interface DeploymentRecord {
  id: string;
  pageId: string;
  version: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "ROLLED_BACK";
  startedAt: Date;
  finishedAt?: Date;
  errorMessage?: string;
  deployedUrl?: string;
  previewUrl?: string;
}

interface DeployStatusProps {
  pageId: string;
  autoRefresh?: number; // segundos
}

export function DeployStatus({ pageId, autoRefresh = 5 }: DeployStatusProps) {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/deploy/status?pageId=${pageId}&limit=5`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao buscar status");
        return;
      }

      setDeployments(data.deployments || []);
    } catch (err: any) {
      setError(err?.message ?? "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();

    if (autoRefresh > 0) {
      const interval = setInterval(fetchStatus, autoRefresh * 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [pageId, autoRefresh]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      RUNNING: "bg-blue-100 text-blue-800",
      SUCCESS: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      ROLLED_BACK: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      PENDING: "⏳",
      RUNNING: "🔄",
      SUCCESS: "✅",
      FAILED: "❌",
      ROLLED_BACK: "↩️",
    };
    return icons[status] || "❓";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Histórico de Publicações</h3>
        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="px-3 py-1 rounded bg-slate-600 text-white text-xs font-medium hover:bg-slate-500 disabled:opacity-50"
        >
          {isLoading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}

      {deployments.length === 0 && !isLoading && (
        <p className="text-slate-400 text-sm">Nenhuma publicação ainda</p>
      )}

      <div className="space-y-2">
        {deployments.map((deployment) => (
          <div
            key={deployment.id}
            className="p-3 rounded border border-slate-200 bg-slate-50 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getStatusIcon(deployment.status)}</span>
                <div>
                  <p className="font-mono text-xs text-slate-600">
                    {deployment.version}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(deployment.startedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(deployment.status)}`}>
                {deployment.status}
              </span>
            </div>

            {deployment.errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {deployment.errorMessage}
              </p>
            )}

            {deployment.deployedUrl && (
              <a
                href={deployment.deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline block"
              >
                🔗 Ver página publicada
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
