import React, { useState } from 'react';
import { PageBlock } from '@/types';

interface PropertiesPanelProps {
  selectedBlock: PageBlock | null;
  onUpdate: (updates: Partial<PageBlock>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedBlock,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  if (!selectedBlock) {
    return (
      <div className="properties-panel w-72 bg-gray-50 border-l border-gray-200 p-6 flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 100px)' }}>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Selecione um bloco para editar propriedades</p>
        </div>
      </div>
    );
  }

  const content = selectedBlock.content as Record<string, any>;

  return (
    <div className="properties-panel w-72 bg-gray-50 border-l border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Propriedades do Bloco</h3>

        {/* Block Type & ID */}
        <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
          <div className="space-y-2 text-sm">
            <div>
              <label className="text-gray-600 font-medium">Tipo</label>
              <p className="text-gray-800 mt-1 bg-gray-100 p-2 rounded">{selectedBlock.type}</p>
            </div>
            <div>
              <label className="text-gray-600 font-medium">ID</label>
              <p className="text-gray-700 text-xs mt-1 font-mono break-all bg-gray-100 p-2 rounded">
                {selectedBlock.id}
              </p>
            </div>
          </div>
        </div>

        {/* Block Content Fields */}
        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-gray-700 text-sm">Conteúdo</h4>

          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
              <label className="text-sm text-gray-600 font-medium capitalize block mb-2">
                {key.replace(/([A-Z])/g, ' $1')}
              </label>

              {typeof value === 'string' && value.length < 100 ? (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    onUpdate({
                      content: {
                        ...content,
                        [key]: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              ) : typeof value === 'boolean' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => {
                      onUpdate({
                        content: {
                          ...content,
                          [key]: e.target.checked,
                        },
                      });
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {value ? 'Habilitado' : 'Desabilitado'}
                  </span>
                </label>
              ) : (
                <textarea
                  value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  onChange={(e) => {
                    onUpdate({
                      content: {
                        ...content,
                        [key]: e.target.value,
                      },
                    });
                  }}
                  rows={3}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none font-mono"
                />
              )}
            </div>
          ))}
        </div>

        {/* Block Settings */}
        {selectedBlock.settings && Object.keys(selectedBlock.settings).length > 0 && (
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-gray-700 text-sm">Configurações</h4>

            {Object.entries(selectedBlock.settings).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                <label className="text-sm text-gray-600 font-medium capitalize block mb-2">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="text"
                  value={typeof value === 'string' ? value : JSON.stringify(value)}
                  onChange={(e) => {
                    onUpdate({
                      settings: {
                        ...selectedBlock.settings,
                        [key]: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <button
            onClick={onDuplicate}
            className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded transition text-sm"
          >
            📋 Duplicar
          </button>
          <button
            onClick={onDelete}
            className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded transition text-sm"
          >
            🗑️ Deletar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
