import { useCallback, useState } from 'react';

export function useBlockSelection() {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const selectBlock = useCallback((blockId: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedBlockIds((prev) => {
        if (prev.includes(blockId)) {
          return prev.filter((id) => id !== blockId);
        }
        return [...prev, blockId];
      });
      setIsMultiSelect(true);
    } else {
      setSelectedBlockId(blockId);
      setSelectedBlockIds([blockId]);
      setIsMultiSelect(false);
    }
  }, []);

  const deselectBlock = useCallback((blockId: string) => {
    setSelectedBlockIds((prev) => prev.filter((id) => id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const deselectAll = useCallback(() => {
    setSelectedBlockId(null);
    setSelectedBlockIds([]);
    setIsMultiSelect(false);
  }, []);

  const deleteSelected = useCallback(() => {
    const toDelete = isMultiSelect ? selectedBlockIds : selectedBlockId ? [selectedBlockId] : [];
    deselectAll();
    return toDelete;
  }, [selectedBlockId, selectedBlockIds, isMultiSelect, deselectAll]);

  const duplicateSelected = useCallback(() => {
    return isMultiSelect ? selectedBlockIds : selectedBlockId ? [selectedBlockId] : [];
  }, [selectedBlockId, selectedBlockIds, isMultiSelect]);

  return {
    selectedBlockId,
    selectedBlockIds,
    isMultiSelect,
    selectBlock,
    deselectBlock,
    deselectAll,
    deleteSelected,
    duplicateSelected,
    hasSelection: selectedBlockId !== null || selectedBlockIds.length > 0,
  };
}
