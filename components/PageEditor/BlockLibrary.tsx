import React from 'react';
import { BlockType } from '@/types';

interface BlockLibraryItem {
  type: BlockType;
  name: string;
  icon: string;
  description: string;
}

interface BlockLibraryProps {
  onBlockAdd: (blockType: BlockType) => void;
  isLoading?: boolean;
}

const BLOCK_LIBRARY: BlockLibraryItem[] = [
  {
    type: 'HEADING',
    name: 'Heading',
    icon: '🔤',
    description: 'Título ou cabeçalho',
  },
  {
    type: 'PARAGRAPH',
    name: 'Parágrafo',
    icon: '📝',
    description: 'Texto descritivo',
  },
  {
    type: 'IMAGE',
    name: 'Imagem',
    icon: '🖼️',
    description: 'Imagem com legenda',
  },
  {
    type: 'BUTTON',
    name: 'Botão',
    icon: '🔘',
    description: 'Call-to-action',
  },
  {
    type: 'FORM',
    name: 'Formulário',
    icon: '📋',
    description: 'Capturador de leads',
  },
  {
    type: 'GALLERY',
    name: 'Galeria',
    icon: '🎨',
    description: 'Galeria de imagens',
  },
  {
    type: 'VIDEO',
    name: 'Vídeo',
    icon: '🎥',
    description: 'Incorporar vídeo',
  },
  {
    type: 'DIVIDER',
    name: 'Divisor',
    icon: '─────',
    description: 'Separador de conteúdo',
  },
  {
    type: 'TESTIMONIAL',
    name: 'Depoimento',
    icon: '💬',
    description: 'Depoimento de cliente',
  },
  {
    type: 'CTA',
    name: 'CTA',
    icon: '⚡',
    description: 'Call-to-action destacada',
  },
  {
    type: 'HERO',
    name: 'Hero',
    icon: '🌟',
    description: 'Seção hero',
  },
];

const BlockLibrary: React.FC<BlockLibraryProps> = ({ onBlockAdd }) => {
  const handleBlockDrag = (e: React.DragEvent<HTMLDivElement>, blockType: BlockType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', blockType);
  };

  return (
    <div className="block-library w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📦 Biblioteca de Blocos</h2>

        <div className="space-y-2">
          {BLOCK_LIBRARY.map((block) => (
            <div
              key={block.type}
              draggable
              onDragStart={(e) => handleBlockDrag(e, block.type)}
              onClick={() => onBlockAdd(block.type)}
              className="block-library-item p-3 bg-white rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">{block.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-700 group-hover:text-blue-600">
                    {block.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{block.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            💡 <strong>Dica:</strong> Arraste blocos ou clique para adicionar ao editor
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockLibrary;
