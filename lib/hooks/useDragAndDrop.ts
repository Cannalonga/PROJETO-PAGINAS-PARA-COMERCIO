import { useCallback, useState } from 'react';
import { PageBlock } from '@/types';

interface DragItem {
  id: string;
  index: number;
  type: 'block';
}

export function useDragAndDrop(blocks: PageBlock[], onBlocksChange: (blocks: PageBlock[]) => void) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, blockId: string, index: number) => {
    setDraggedItem({ id: blockId, index, type: 'block' });
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(targetIndex);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (!draggedItem) return;

      const sourceIndex = draggedItem.index;
      if (sourceIndex === targetIndex) {
        setDraggedItem(null);
        setIsDragging(false);
        setDragOverIndex(null);
        return;
      }

      // Reorder blocks
      const newBlocks = [...blocks];
      const [movedBlock] = newBlocks.splice(sourceIndex, 1);
      newBlocks.splice(targetIndex, 0, movedBlock);

      onBlocksChange(newBlocks);

      setDraggedItem(null);
      setIsDragging(false);
      setDragOverIndex(null);
    },
    [draggedItem, blocks, onBlocksChange]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setIsDragging(false);
    setDragOverIndex(null);
  }, []);

  const moveBlock = useCallback(
    (sourceIndex: number, targetIndex: number) => {
      if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return;

      const newBlocks = [...blocks];
      const [movedBlock] = newBlocks.splice(sourceIndex, 1);
      newBlocks.splice(targetIndex, 0, movedBlock);

      onBlocksChange(newBlocks);
    },
    [blocks, onBlocksChange]
  );

  return {
    draggedItem,
    isDragging,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    moveBlock,
  };
}
