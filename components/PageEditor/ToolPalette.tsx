import React from 'react';

interface ToolPaletteProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPreview: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSaving?: boolean;
}

const ToolPalette: React.FC<ToolPaletteProps> = ({
  onUndo,
  onRedo,
  onSave,
  onPreview,
  canUndo,
  canRedo,
  isSaving = false,
}) => {
  return (
    <div className="tool-palette bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Desfazer (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Refazer (Ctrl+Y)"
        >
          ↷
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Preview & Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPreview}
          className="px-4 py-2 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition"
          title="Visualizar página"
        >
          👁️ Pré-visualização
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition disabled:cursor-not-allowed"
          title="Salvar alterações"
        >
          {isSaving ? '💾 Salvando...' : '💾 Salvar'}
        </button>
      </div>
    </div>
  );
};

export default ToolPalette;
