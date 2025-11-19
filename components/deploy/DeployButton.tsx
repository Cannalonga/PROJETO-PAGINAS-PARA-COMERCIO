// components/deploy/DeployButton.tsx
"use client";

import { useState } from "react";

interface DeployButtonProps {
  pageId: string;
  slug: string;
}

export function DeployButton({ pageId, slug }: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleDeploy() {
    setIsDeploying(true);
    setMessage(null);
    setIsSuccess(false);

    try {
      const res = await fetch("/api/deploy/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          `Erro: ${data.error ?? "Falha no deploy"} - ${data.details || ""}`
        );
        setIsSuccess(false);
        return;
      }

      setMessage(
        `✅ Deploy OK! Versão ${data.version}\n📍 URL: ${data.deployedUrl || "em processamento"}`
      );
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro inesperado";
      setMessage(`❌ Erro: ${errorMsg}`);
      setIsSuccess(false);
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleDeploy}
        disabled={isDeploying}
        className={`px-4 py-2 rounded-md font-medium text-sm text-white transition-colors ${
          isDeploying
            ? "bg-slate-600 cursor-not-allowed opacity-60"
            : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700"
        }`}
      >
        {isDeploying ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
            Publicando...
          </span>
        ) : (
          "Publicar página"
        )}
      </button>

      {message && (
        <p
          className={`text-xs whitespace-pre-wrap rounded-md p-2.5 border ${
            isSuccess
              ? "border-emerald-700/50 bg-emerald-950/30 text-emerald-200"
              : "border-red-700/50 bg-red-950/30 text-red-200"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
