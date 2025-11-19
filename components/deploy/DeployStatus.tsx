// components/deploy/DeployStatus.tsx
"use client";

import { useEffect, useState } from "react";

interface DeployStatusProps {
  pageId: string;
}

interface Deployment {
  id: string;
  status: string;
  version: string;
  deployedUrl?: string;
  previewUrl?: string;
  startedAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export function DeployStatus({ pageId }: DeployStatusProps) {
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/deploy/status?pageId=${encodeURIComponent(pageId)}`
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setError("Nenhum deploy encontrado para esta página");
          setDeployment(null);
          return;
        }
        setError(data.error ?? "Erro ao carregar status");
        return;
      }

      setDeployment(data.deployment);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [pageId]);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-slate-300" />
          Carregando status...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-700/40 bg-red-950/40 p-4 text-xs text-red-200">
        <div className="font-semibold">Status de Deploy</div>
        <div className="mt-1">{error}</div>
        <button
          onClick={fetchStatus}
          className="mt-2 text-[11px] text-red-300 hover:text-red-200 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-300">
        Nenhum deploy encontrado para esta página.
      </div>
    );
  }

  const statusColor =
    deployment.status === "SUCCESS"
      ? "bg-emerald-600/20 text-emerald-300"
      : deployment.status === "FAILED"
        ? "bg-red-600/20 text-red-300"
        : deployment.status === "RUNNING"
          ? "bg-yellow-600/20 text-yellow-300"
          : "bg-slate-600/20 text-slate-300";

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-xs text-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Status do Deploy</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor}`}>
          {deployment.status}
        </span>
      </div>

      <div className="space-y-1 text-slate-300">
        <div>
          <span className="text-slate-400">Versão:</span> {deployment.version}
        </div>

        {deployment.deployedUrl && (
          <div className="truncate">
            <span className="text-slate-400">URL:</span>{" "}
            <a
              href={deployment.deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-300 hover:text-sky-200 underline"
            >
              {deployment.deployedUrl}
            </a>
          </div>
        )}

        {deployment.previewUrl && (
          <div className="truncate">
            <span className="text-slate-400">Preview:</span>{" "}
            <a
              href={deployment.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-300 hover:text-sky-200 underline"
            >
              {deployment.previewUrl}
            </a>
          </div>
        )}

        <div className="text-[11px] text-slate-400">
          <div>
            Iniciado:{" "}
            {new Date(deployment.startedAt).toLocaleString("pt-BR")}
          </div>
          {deployment.finishedAt && (
            <div>
              Finalizado:{" "}
              {new Date(deployment.finishedAt).toLocaleString("pt-BR")}
            </div>
          )}
        </div>

        {deployment.errorMessage && (
          <div className="rounded-md bg-red-950/50 p-2 text-red-200">
            <span className="text-slate-400">Erro:</span> {deployment.errorMessage}
          </div>
        )}
      </div>

      <button
        onClick={fetchStatus}
        className="text-[11px] text-sky-300 hover:text-sky-200 underline"
      >
        Atualizar status
      </button>
    </div>
  );
}
