import React, { useCallback } from 'react';
import { PageBlock } from '@/types';
import BlockItem from './BlockItem';

interface CanvasProps {
  blocks: PageBlock[];
  selectedBlockId: string | null;
  selectedBlockIds: string[];
  onBlockSelect: (blockId: string, multiSelect?: boolean) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockUpdate: (blockId: string, updates: Partial<PageBlock>) => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}

const Canvas: React.FC<CanvasProps> = ({
  blocks,
  selectedBlockId,
  selectedBlockIds,
  onBlockSelect,
  onBlockDelete,
  onBlockUpdate,
  isDragging,
  dragOverIndex,
}) => {
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    []
  );

  return (
    <div
      className="canvas-container flex-1 bg-white border-l border-gray-200 overflow-y-auto"
      onDragOver={handleDragOver}
      style={{
        minHeight: '600px',
        maxHeight: 'calc(100vh - 100px)',
      }}
    >
      <div className="canvas-content p-8 bg-gradient-to-b from-gray-50 to-white">
        {blocks.length === 0 ? (
          <div className="empty-state flex flex-col items-center justify-center h-96 text-center">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-500 mb-2">Nenhum bloco adicionado</h3>
            <p className="text-sm text-gray-400">
              Arraste blocos da biblioteca ou use o painel de ferramentas para começar
            </p>
          </div>
        ) : (
          <div className="blocks-list space-y-4">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className={`block-wrapper transition-all duration-200 ${
                  dragOverIndex === index ? 'bg-blue-50 border-2 border-blue-400 rounded' : ''
                }`}
                style={{
                  opacity: isDragging && !selectedBlockIds.includes(block.id) ? 0.5 : 1,
                }}
              >
                <BlockItem
                  block={block}
                  index={index}
                  isSelected={selectedBlockId === block.id}
                  isMultiSelected={selectedBlockIds.includes(block.id)}
                  onSelect={() => onBlockSelect(block.id)}
                  onSelectMulti={() => onBlockSelect(block.id, true)}
                  onDelete={() => onBlockDelete(block.id)}
                  onUpdate={(updates: Partial<PageBlock>) => onBlockUpdate(block.id, updates)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
