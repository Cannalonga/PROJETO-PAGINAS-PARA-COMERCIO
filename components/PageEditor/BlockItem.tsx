import React from 'react';
import { PageBlock } from '@/types';

interface BlockItemProps {
  block: PageBlock;
  index: number;
  isSelected: boolean;
  isMultiSelected: boolean;
  onSelect: () => void;
  onSelectMulti: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<PageBlock>) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  isSelected,
  isMultiSelected,
  onSelect,
  onSelectMulti,
  onDelete,
}) => {
  const getBlockPreview = (block: PageBlock): string => {
    const content = block.content as Record<string, any>;
    switch (block.type) {
      case 'HEADING':
        return content.text || 'Heading';
      case 'PARAGRAPH':
        return (content.text || 'Paragraph').substring(0, 50) + '...';
      case 'IMAGE':
        return `Image: ${content.alt || 'Untitled'}`;
      case 'BUTTON':
        return `Button: ${content.label || 'Click me'}`;
      case 'FORM':
        return `Form with ${content.fields?.length || 0} fields`;
      case 'GALLERY':
        return `Gallery: ${content.images?.length || 0} images`;
      case 'VIDEO':
        return `Video: ${content.title || 'Untitled'}`;
      default:
        return `${block.type} Block`;
    }
  };

  return (
    <div
      className={`block-item rounded-lg border-2 transition-all cursor-move ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : isMultiSelected
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          onSelectMulti();
        } else {
          onSelect();
        }
      }}
      draggable
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3 flex-1">
            <div className="text-gray-400 text-sm font-medium w-6 text-center">{index + 1}</div>
            <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
              {block.type}
            </span>
            <span className="text-gray-400">▼</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition"
              title="Duplicar bloco"
              onClick={(e) => {
                e.stopPropagation();
                // duplicateBlock(block.id);
              }}
            >
              📋
            </button>
            <button
              className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition"
              title="Deletar bloco"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">{getBlockPreview(block)}</div>

        {isSelected && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            ID: {block.id}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockItem;
