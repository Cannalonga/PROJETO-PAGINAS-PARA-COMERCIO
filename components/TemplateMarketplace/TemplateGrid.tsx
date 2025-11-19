import React from 'react';
import { Template } from '@/types';

interface TemplateGridProps {
  templates: Template[];
  isLoading?: boolean;
  onTemplateSelect: (template: Template) => void;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  isLoading = false,
  onTemplateSelect,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum template encontrado</h3>
        <p className="text-gray-500">Tente ajustar seus filtros ou busca</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={() => onTemplateSelect(template)}
        />
      ))}
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        {template.preview ? (
          <img src={template.preview} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl">📄</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

        {/* Category badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {template.category}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition"
        >
          📋 Usar Template
        </button>
      </div>
    </div>
  );
};

export default TemplateGrid;
export { TemplateCard };
