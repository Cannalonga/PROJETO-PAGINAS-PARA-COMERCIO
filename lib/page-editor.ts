/**
 * Page Editor Library
 * Handles page creation, editing, and management logic
 */

import { PageBlock } from '../types/index';

export interface Page {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description?: string;
  content: PageBlock[];
  template: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageRequest {
  title: string;
  slug: string;
  template: string;
  description?: string;
}

export interface UpdatePageRequest {
  title?: string;
  slug?: string;
  description?: string;
  content?: PageBlock[];
}

/**
 * Validate page slug format
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 255;
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 255);
}

/**
 * Validate page block structure
 */
export function validatePageBlock(block: PageBlock): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!block.id) errors.push('Block must have an id');
  if (!block.type) errors.push('Block must have a type');
  if (!block.content) errors.push('Block must have content');
  if (typeof block.order !== 'number') errors.push('Block must have an order');

  const validTypes = ['heading', 'paragraph', 'image', 'button', 'form', 'gallery'];
  if (!validTypes.includes(block.type)) {
    errors.push(`Invalid block type: ${block.type}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sort page blocks by order
 */
export function sortPageBlocks(blocks: PageBlock[]): PageBlock[] {
  return [...blocks].sort((a, b) => a.order - b.order);
}

/**
 * Add new block to page content
 */
export function addPageBlock(
  blocks: PageBlock[],
  newBlock: Omit<PageBlock, 'order'>,
): PageBlock[] {
  const maxOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.order)) : 0;
  return [
    ...blocks,
    {
      ...newBlock,
      order: maxOrder + 1,
    },
  ];
}

/**
 * Remove block from page content
 */
export function removePageBlock(blocks: PageBlock[], blockId: string): PageBlock[] {
  return blocks.filter((b) => b.id !== blockId);
}

/**
 * Update block in page content
 */
export function updatePageBlock(
  blocks: PageBlock[],
  blockId: string,
  updates: Partial<PageBlock>,
): PageBlock[] {
  return blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
}

/**
 * Reorder blocks
 */
export function reorderPageBlocks(
  blocks: PageBlock[],
  blockId: string,
  newOrder: number,
): PageBlock[] {
  const updated = blocks.map((b) => (b.id === blockId ? { ...b, order: newOrder } : b));
  return sortPageBlocks(updated);
}

/**
 * Move block to specific position (drag-and-drop)
 */
export function moveBlockToPosition(
  blocks: PageBlock[],
  blockId: string,
  targetPosition: number,
): PageBlock[] {
  const index = blocks.findIndex((b) => b.id === blockId);
  if (index === -1 || targetPosition === index) return blocks;

  const newBlocks = [...blocks];
  const [block] = newBlocks.splice(index, 1);
  newBlocks.splice(targetPosition, 0, block);

  // Recalculate order based on new positions
  return newBlocks.map((b, idx) => ({ ...b, order: idx }));
}

/**
 * Duplicate block
 */
export function duplicatePageBlock(
  blocks: PageBlock[],
  blockId: string,
): PageBlock[] {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return blocks;

  const maxOrder = Math.max(...blocks.map((b) => b.order), -1);
  const duplicatedBlock: PageBlock = {
    ...block,
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    order: maxOrder + 1,
  };

  return [...blocks, duplicatedBlock];
}

/**
 * Duplicate multiple blocks
 */
export function duplicateMultipleBlocks(
  blocks: PageBlock[],
  blockIds: string[],
): PageBlock[] {
  const maxOrder = Math.max(...blocks.map((b) => b.order), -1);
  let newOrder = maxOrder + 1;

  const duplicated = blockIds
    .map((blockId) => blocks.find((b) => b.id === blockId))
    .filter((block) => block !== undefined) as PageBlock[];

  const newBlocks = duplicated.map((block) => ({
    ...block,
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    order: newOrder++,
  }));

  return [...blocks, ...newBlocks];
}

/**
 * Delete multiple blocks
 */
export function deleteMultipleBlocks(
  blocks: PageBlock[],
  blockIds: string[],
): PageBlock[] {
  const filtered = blocks.filter((b) => !blockIds.includes(b.id));
  return filtered.map((b, idx) => ({ ...b, order: idx }));
}

/**
 * Record block operation in history (for undo/redo)
 */
export interface BlockOperation {
  type: 'add' | 'remove' | 'update' | 'move' | 'duplicate';
  blockId?: string;
  blockIds?: string[];
  oldValue?: PageBlock | PageBlock[];
  newValue?: PageBlock | PageBlock[];
  timestamp: number;
}

export function recordBlockOperation(
  operation: Omit<BlockOperation, 'timestamp'>,
): BlockOperation {
  return {
    ...operation,
    timestamp: Date.now(),
  };
}

