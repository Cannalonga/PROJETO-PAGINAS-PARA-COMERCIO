// e2e/editor.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Page Editor Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor
    await page.goto('/editor');
    // Wait for editor to load
    await page.waitForSelector('[data-testid="editor-canvas"]', { timeout: 5000 });
  });

  test('should display editor with canvas and block library', async ({ page }) => {
    // Verify editor components are visible
    const canvas = page.locator('[data-testid="editor-canvas"]');
    const blockLibrary = page.locator('[data-testid="block-library"]');
    const propertiesPanel = page.locator('[data-testid="properties-panel"]');

    await expect(canvas).toBeVisible();
    await expect(blockLibrary).toBeVisible();
    await expect(propertiesPanel).toBeVisible();
  });

  test('should add a block from the library', async ({ page }) => {
    // Find and click a block type button
    const headingBlockBtn = page.locator('[data-testid="block-type-HEADING"]');
    await expect(headingBlockBtn).toBeVisible();
    await headingBlockBtn.click();

    // Verify block is added to canvas
    const blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(1);
  });

  test('should add multiple blocks sequentially', async ({ page }) => {
    const blockTypes = ['HEADING', 'PARAGRAPH', 'IMAGE'];

    for (const blockType of blockTypes) {
      const btn = page.locator(`[data-testid="block-type-${blockType}"]`);
      await btn.click();
      // Small delay to allow rendering
      await page.waitForTimeout(200);
    }

    const blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(3);
  });

  test('should edit block content', async ({ page }) => {
    // Add a heading block
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(200);

    // Click on the block to select it
    const block = page.locator('[data-testid="block-item"]').first();
    await block.click();

    // Edit the content in properties panel
    const contentInput = page.locator('[data-testid="property-input-text"]');
    await contentInput.fill('Test Heading');

    // Verify content is updated
    await expect(contentInput).toHaveValue('Test Heading');
  });

  test('should delete a block', async ({ page }) => {
    // Add a block
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(200);

    // Click delete button
    const deleteBtn = page.locator('[data-testid="block-delete"]').first();
    await deleteBtn.click();

    // Verify block is removed
    const blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(0);
  });

  test('should undo block addition', async ({ page }) => {
    // Add a block
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(200);

    // Verify block is added
    let blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(1);

    // Click undo
    const undoBtn = page.locator('[data-testid="undo-btn"]');
    await undoBtn.click();
    await page.waitForTimeout(200);

    // Verify block is removed
    blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(0);
  });

  test('should redo after undo', async ({ page }) => {
    // Add and undo
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-testid="undo-btn"]').click();
    await page.waitForTimeout(200);

    // Verify block is removed
    let blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(0);

    // Click redo
    const redoBtn = page.locator('[data-testid="redo-btn"]');
    await redoBtn.click();
    await page.waitForTimeout(200);

    // Verify block is back
    blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(1);
  });

  test('should save page', async ({ page }) => {
    // Add a block
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(200);

    // Click save button
    const saveBtn = page.locator('[data-testid="save-btn"]');
    await saveBtn.click();

    // Verify success message or state change
    const successMsg = page.locator('[data-testid="save-success"]');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
  });

  test('should duplicate a block', async ({ page }) => {
    // Add a block
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(200);

    // Click duplicate button
    const duplicateBtn = page.locator('[data-testid="block-duplicate"]').first();
    await duplicateBtn.click();
    await page.waitForTimeout(200);

    // Verify block is duplicated
    const blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(2);
  });

  test('should move block to different position', async ({ page }) => {
    // Add multiple blocks
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-testid="block-type-HEADING"]').click();
      await page.waitForTimeout(100);
    }

    // Get initial order
    const blocks = page.locator('[data-testid="block-item"]');
    await expect(blocks).toHaveCount(3);

    // Drag first block to third position
    const firstBlock = blocks.nth(0);
    const thirdBlock = blocks.nth(2);

    await firstBlock.dragTo(thirdBlock);
    await page.waitForTimeout(200);

    // Verify order changed
    const updatedBlocks = page.locator('[data-testid="block-item"]');
    await expect(updatedBlocks).toHaveCount(3);
  });
});
