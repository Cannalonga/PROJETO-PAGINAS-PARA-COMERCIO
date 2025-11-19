import { useCallback, useState } from 'react';
import { PageBlock } from '@/types';

interface HistoryState {
  blocks: PageBlock[];
  timestamp: number;
}

export function useUndo(initialBlocks: PageBlock[], maxHistory: number = 50) {
  const [history, setHistory] = useState<HistoryState[]>([
    { blocks: initialBlocks, timestamp: Date.now() },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getCurrentBlocks = useCallback(() => {
    return history[currentIndex].blocks;
  }, [history, currentIndex]);

  const recordChange = useCallback(
    (newBlocks: PageBlock[]) => {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push({
        blocks: newBlocks,
        timestamp: Date.now(),
      });

      if (newHistory.length > maxHistory) {
        newHistory.shift();
      } else {
        setCurrentIndex(newHistory.length - 1);
      }

      setHistory(newHistory);
    },
    [history, currentIndex, maxHistory]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const clearHistory = useCallback(() => {
    setHistory([{ blocks: initialBlocks, timestamp: Date.now() }]);
    setCurrentIndex(0);
  }, [initialBlocks]);

  const getHistory = useCallback(() => {
    return history.map((state, index) => ({
      ...state,
      isCurrent: index === currentIndex,
    }));
  }, [history, currentIndex]);

  return {
    blocks: getCurrentBlocks(),
    recordChange,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistory,
    historyLength: history.length,
    currentHistoryIndex: currentIndex,
  };
}
