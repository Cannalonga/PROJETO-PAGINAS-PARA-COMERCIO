// components/deploy/DeployPreviewLink.tsx
"use client";

import { useState } from "react";

interface DeployPreviewLinkProps {
  pageId: string;
  slug: string;
  onPreviewGenerated?: (previewUrl: string) => void;
}

export function DeployPreviewLink({
  pageId,
  slug,
  onPreviewGenerated,
}: DeployPreviewLinkProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGeneratePreview() {
    setIsGenerating(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const res = await fetch("/api/deploy/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao gerar preview");
        return;
      }

      setPreviewUrl(data.previewUrl);
      onPreviewGenerated?.(data.previewUrl);
    } catch (err: any) {
      setError(err?.message ?? "Erro desconhecido");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleGeneratePreview}
        disabled={isGenerating}
        className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
      >
        {isGenerating ? "Gerando preview..." : "👀 Visualizar antes de publicar"}
      </button>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      {previewUrl && (
        <div className="space-y-1">
          <p className="text-xs text-slate-600">Preview gerado:</p>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline block truncate"
          >
            {previewUrl}
          </a>
          <p className="text-xs text-slate-400">
            ℹ️ Preview disponível por 24 horas
          </p>
        </div>
      )}
    </div>
  );
}
