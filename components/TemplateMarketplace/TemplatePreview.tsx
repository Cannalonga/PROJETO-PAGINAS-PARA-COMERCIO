import React from 'react';
import { Template } from '@/types';

interface TemplatePreviewProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onClone: (template: Template) => void;
  isCloning?: boolean;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onClone,
  isCloning = false,
}) => {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{template.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Categoria</label>
              <p className="text-gray-800 mt-1">{template.category}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <p className="text-gray-800 mt-1">{template.isPublic ? '🌍 Público' : '🔒 Privado'}</p>
            </div>
          </div>

          {/* Description */}
          {template.description && (
            <div>
              <label className="text-sm font-semibold text-gray-600">Descrição</label>
              <p className="text-gray-700 mt-2">{template.description}</p>
            </div>
          )}

          {/* Preview */}
          {template.preview && (
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2">
                Pré-visualização
              </label>
              <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-2">
                Variáveis do Template
              </label>
              <div className="space-y-2">
                {template.variables.map((variable) => (
                  <div
                    key={typeof variable === 'string' ? variable : variable.name}
                    className="flex items-start gap-3 p-2 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">
                        {typeof variable === 'string' ? variable : variable.name}
                      </p>
                      {typeof variable !== 'string' && variable.description && (
                        <p className="text-sm text-gray-600">{variable.description}</p>
                      )}
                      {typeof variable !== 'string' && (
                        <p className="text-xs text-gray-500 mt-1">Tipo: {variable.type}</p>
                      )}
                    </div>
                    {typeof variable !== 'string' && variable.required && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        Obrigatório
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onClone(template)}
              disabled={isCloning}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
            >
              {isCloning ? '⏳ Clonando...' : '📋 Usar Este Template'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
