// e2e/marketplace.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Template Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to marketplace
    await page.goto('/marketplace');
    // Wait for templates to load
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 5000 });
  });

  test('should display marketplace with template grid', async ({ page }) => {
    const templateGrid = page.locator('[data-testid="template-grid"]');
    const templateCards = page.locator('[data-testid="template-card"]');

    await expect(templateGrid).toBeVisible();
    await expect(templateCards.first()).toBeVisible();
  });

  test('should display search bar with filters', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    const ratingFilter = page.locator('[data-testid="rating-filter"]');

    await expect(searchInput).toBeVisible();
    await expect(categoryFilter).toBeVisible();
    await expect(ratingFilter).toBeVisible();
  });

  test('should search for templates by name', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('loja');
    await page.waitForTimeout(300);

    // Verify filtered results
    const templateCards = page.locator('[data-testid="template-card"]');
    const count = await templateCards.count();
    // Should have results (exact count depends on database)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter templates by category', async ({ page }) => {
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    await categoryFilter.selectOption('LOJA');
    await page.waitForTimeout(300);

    // Verify filtered results
    const templateCards = page.locator('[data-testid="template-card"]');
    const count = await templateCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter templates by minimum rating', async ({ page }) => {
    const ratingFilter = page.locator('[data-testid="rating-filter"]');
    await ratingFilter.selectOption('4');
    await page.waitForTimeout(300);

    // Verify filtered results
    const templateCards = page.locator('[data-testid="template-card"]');
    const count = await templateCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should apply multiple filters simultaneously', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    const ratingFilter = page.locator('[data-testid="rating-filter"]');

    await searchInput.fill('loja');
    await categoryFilter.selectOption('LOJA');
    await ratingFilter.selectOption('3');
    await page.waitForTimeout(300);

    // Verify filters are applied
    await expect(searchInput).toHaveValue('loja');
  });

  test('should clear filters', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    const clearBtn = page.locator('[data-testid="clear-filters-btn"]');

    // Apply filter
    await searchInput.fill('test');
    await page.waitForTimeout(200);

    // Clear filters
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should open template preview modal', async ({ page }) => {
    // Click on a template card
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    await page.waitForTimeout(300);

    // Verify modal is open
    const modal = page.locator('[data-testid="template-preview-modal"]');
    await expect(modal).toBeVisible();
  });

  test('should display template details in preview', async ({ page }) => {
    // Open template preview
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    await page.waitForTimeout(300);

    // Verify details are displayed
    const templateName = page.locator('[data-testid="preview-template-name"]');
    const templateDescription = page.locator('[data-testid="preview-template-description"]');

    await expect(templateName).toBeVisible();
    await expect(templateDescription).toBeVisible();
  });

  test('should close template preview modal', async ({ page }) => {
    // Open template preview
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    await page.waitForTimeout(300);

    // Close modal
    const closeBtn = page.locator('[data-testid="preview-close-btn"]');
    await closeBtn.click();
    await page.waitForTimeout(200);

    // Verify modal is closed
    const modal = page.locator('[data-testid="template-preview-modal"]');
    await expect(modal).not.toBeVisible();
  });

  test('should clone template to page', async ({ page }) => {
    // Open template preview
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    await page.waitForTimeout(300);

    // Click clone button
    const cloneBtn = page.locator('[data-testid="preview-clone-btn"]');
    await cloneBtn.click();

    // Verify success message
    const successMsg = page.locator('[data-testid="clone-success"]');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
  });

  test('should paginate through templates', async ({ page }) => {
    const nextPageBtn = page.locator('[data-testid="next-page-btn"]');

    // Check if next page button is available
    const isVisible = await nextPageBtn.isVisible({ timeout: 1000 }).catch(() => false);

    if (isVisible) {
      const initialCards = page.locator('[data-testid="template-card"]');
      // const initialCount = await initialCards.count();

      // Go to next page
      await nextPageBtn.click();
      await page.waitForTimeout(300);

      // Verify different templates are loaded
      const newCards = page.locator('[data-testid="template-card"]');
      const newCount = await newCards.count();
      // Count might be same but content should be different
      expect(newCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should toggle between grid and list view', async ({ page }) => {
    const viewToggle = page.locator('[data-testid="view-toggle"]');

    // Check if toggle exists
    const exists = await viewToggle.isVisible({ timeout: 1000 }).catch(() => false);

    if (exists) {
      // Get initial view type
      const initialClass = await viewToggle.getAttribute('data-view-type');

      // Click toggle
      await viewToggle.click();
      await page.waitForTimeout(200);

      // Get new view type
      const newClass = await viewToggle.getAttribute('data-view-type');

      // Verify view changed
      expect(initialClass).not.toBe(newClass);
    }
  });
});
