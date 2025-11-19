import React, { useState, useCallback } from 'react';
import { PageBlock, BlockType, Page } from '@/types';
import { useDragAndDrop, useUndo, useBlockSelection } from '@/lib/hooks';
import {
  // moveBlockToPosition,
  duplicatePageBlock,
  // deleteMultipleBlocks,
  addPageBlock,
  removePageBlock,
  updatePageBlock,
} from '@/lib/page-editor';
import BlockLibrary from './BlockLibrary';
import ToolPalette from './ToolPalette';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';

interface EditorProps {
  page: Page;
  onSave: (updates: Partial<Page>) => Promise<void>;
  onPreview: () => void;
}

const Editor: React.FC<EditorProps> = ({ page, onSave, onPreview }) => {
  const initialBlocks = page.content || [];
  const { blocks, recordChange, undo, redo, canUndo, canRedo /* clearHistory */ } = useUndo(
    initialBlocks as PageBlock[]
  );
  const {
    selectedBlockId,
    selectedBlockIds,
    selectBlock,
    deselectBlock,
    // deselectAll,
    // deleteSelected,
  } = useBlockSelection();

  const {
    isDragging,
    dragOverIndex,
    // handleDragStart,
    // handleDragOver,
    // handleDragLeave,
    // handleDrop,
    // handleDragEnd,
  } = useDragAndDrop(blocks, recordChange);

  const [isSaving, setIsSaving] = useState(false);

  // Get selected block details
  const selectedBlock = selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : null;

  // Handle block addition
  const handleBlockAdd = useCallback(
    (blockType: BlockType) => {
      const newBlock: PageBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pageId: page.id,
        type: blockType,
        position: blocks.length,
        content: getDefaultContent(blockType),
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newBlocks = addPageBlock(blocks, newBlock);
      recordChange(newBlocks);
    },
    [blocks, page.id, recordChange]
  );

  // Handle block deletion
  const handleBlockDelete = useCallback(
    (blockId: string) => {
      const newBlocks = removePageBlock(blocks, blockId);
      recordChange(newBlocks);
      deselectBlock(blockId);
    },
    [blocks, recordChange, deselectBlock]
  );

  // Handle block update
  const handleBlockUpdate = useCallback(
    (blockId: string, updates: Partial<PageBlock>) => {
      const newBlocks = updatePageBlock(blocks, blockId, updates);
      recordChange(newBlocks);
    },
    [blocks, recordChange]
  );

  // Handle block movement (drag-drop)
  // const handleBlockDrop = useCallback(
  //   (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
  //     handleDrop(e, targetIndex);
  //
  //     // If block was moved, find its new index and update
  //     const draggedBlockType = e.dataTransfer.getData('blockType') as BlockType;
  //     if (draggedBlockType && !blocks.some((b) => b.type === draggedBlockType)) {
  //       // New block from library
  //       handleBlockAdd(draggedBlockType);
  //     }
  //   },
  //   [blocks, handleDrop, handleBlockAdd]
  // );

  // Handle duplicate
  const handleDuplicate = useCallback(() => {
    if (selectedBlockId) {
      const newBlocks = duplicatePageBlock(blocks, selectedBlockId);
      recordChange(newBlocks);
    }
  }, [blocks, selectedBlockId, recordChange]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave({ content: blocks });
      // Show success notification (you can add toast here)
    } finally {
      setIsSaving(false);
    }
  }, [blocks, onSave]);

  // Handle undo/redo with keyboard
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave]);

  return (
    <div className="editor flex h-screen bg-white">
      {/* Block Library */}
      <BlockLibrary onBlockAdd={handleBlockAdd} />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tool Palette */}
        <ToolPalette
          onUndo={undo}
          onRedo={redo}
          onSave={handleSave}
          onPreview={onPreview}
          canUndo={canUndo}
          canRedo={canRedo}
          isSaving={isSaving}
        />

        {/* Editor Content */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <Canvas
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            selectedBlockIds={selectedBlockIds}
            onBlockSelect={selectBlock}
            onBlockDelete={handleBlockDelete}
            onBlockUpdate={handleBlockUpdate}
            isDragging={isDragging}
            dragOverIndex={dragOverIndex}
          />

          {/* Properties Panel */}
          <PropertiesPanel
            selectedBlock={selectedBlock || null}
            onUpdate={(updates) => {
              if (selectedBlockId) {
                handleBlockUpdate(selectedBlockId, updates);
              }
            }}
            onDuplicate={handleDuplicate}
            onDelete={() => {
              if (selectedBlockId) {
                handleBlockDelete(selectedBlockId);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Get default content for block type
 */
function getDefaultContent(blockType: BlockType): Record<string, any> {
  const defaults: Record<BlockType, Record<string, any>> = {
    HEADING: { text: 'Novo Título', level: 'h2' },
    PARAGRAPH: { text: 'Adicione seu texto aqui' },
    IMAGE: { alt: 'Imagem', src: '' },
    BUTTON: { label: 'Clique aqui', url: '#' },
    FORM: { fields: [], submitText: 'Enviar' },
    GALLERY: { images: [], columns: 3 },
    VIDEO: { title: 'Vídeo', url: '', thumbnailUrl: '' },
    DIVIDER: { style: 'solid', color: '#ccc' },
    TESTIMONIAL: { text: 'Depoimento do cliente', author: 'Nome do cliente', role: 'Cargo' },
    CTA: { heading: 'Chamada para ação', description: 'Descrição', buttonText: 'Ação' },
    HERO: { title: 'Hero Title', subtitle: 'Hero Subtitle', image: '', ctaText: 'Começar' },
    CUSTOM: { rawHtml: '' },
  };

  return defaults[blockType] || {};
}

export default Editor;
