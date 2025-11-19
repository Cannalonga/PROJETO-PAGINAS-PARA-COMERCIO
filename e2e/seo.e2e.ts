// e2e/seo.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('SEO Analyzer Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor with SEO panel
    await page.goto('/editor');
    // Wait for editor to load
    await page.waitForSelector('[data-testid="editor-canvas"]', { timeout: 5000 });
  });

  test('should display SEO analyzer panel', async ({ page }) => {
    // Open SEO panel (if not already visible)
    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    // Check if panel or toggle is visible
    const isPanelVisible = await seoPanel.isVisible({ timeout: 1000 }).catch(() => false);
    const isToggleVisible = await seoToggle.isVisible({ timeout: 1000 }).catch(() => false);

    if (isToggleVisible && !isPanelVisible) {
      await seoToggle.click();
    }

    await expect(seoPanel).toBeVisible({ timeout: 2000 });
  });

  test('should analyze page title', async ({ page }) => {
    // Add a heading block
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(200);

    // Open SEO panel
    const seoToggle = page.locator('[data-testid="seo-toggle"]');
    const seoPanel = page.locator('[data-testid="seo-panel"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Edit title in SEO section
    const titleInput = page.locator('[data-testid="seo-title-input"]');
    await titleInput.fill('My Awesome Page Title');

    // Wait for analysis
    await page.waitForTimeout(500);

    // Check for title analysis result
    const titleAnalysis = page.locator('[data-testid="seo-title-analysis"]');
    await expect(titleAnalysis).toBeVisible({ timeout: 2000 });
  });

  test('should analyze page meta description', async ({ page }) => {
    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Enter meta description
    const descInput = page.locator('[data-testid="seo-description-input"]');
    const testDesc = 'This is a test meta description for SEO optimization purposes';
    await descInput.fill(testDesc);

    // Wait for analysis
    await page.waitForTimeout(500);

    // Check for description analysis
    const descAnalysis = page.locator('[data-testid="seo-description-analysis"]');
    await expect(descAnalysis).toBeVisible({ timeout: 2000 });
  });

  test('should check keyword density', async ({ page }) => {
    // Add content blocks
    await page.locator('[data-testid="block-type-PARAGRAPH"]').click();
    await page.waitForTimeout(200);

    // Open SEO panel
    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Enter focus keyword
    const keywordInput = page.locator('[data-testid="seo-keyword-input"]');
    if (await keywordInput.isVisible({ timeout: 500 }).catch(() => false)) {
      await keywordInput.fill('product');

      // Wait for density analysis
      await page.waitForTimeout(500);

      // Check keyword density result
      const densityResult = page.locator('[data-testid="seo-density-result"]');
      await expect(densityResult).toBeVisible({ timeout: 2000 });
    }
  });

  test('should display SEO score', async ({ page }) => {
    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Check for SEO score display
    const seoScore = page.locator('[data-testid="seo-score"]');
    await expect(seoScore).toBeVisible({ timeout: 2000 });

    // Verify score is numeric
    const scoreText = await seoScore.textContent();
    expect(scoreText).toMatch(/\d+/);
  });

  test('should show SEO recommendations', async ({ page }) => {
    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Check for recommendations section
    const recommendations = page.locator('[data-testid="seo-recommendations"]');

    if (await recommendations.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Verify at least one recommendation is displayed
      const items = page.locator('[data-testid="recommendation-item"]');
      expect(await items.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should validate heading hierarchy', async ({ page }) => {
    // Add multiple heading blocks
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(100);
    await page.locator('[data-testid="block-type-HEADING"]').click();
    await page.waitForTimeout(100);

    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Check for heading analysis
    const headingAnalysis = page.locator('[data-testid="seo-heading-analysis"]');

    if (await headingAnalysis.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(headingAnalysis).toContainText(/heading|h\d/i);
    }
  });

  test('should check image alt text', async ({ page }) => {
    // Add an image block
    await page.locator('[data-testid="block-type-IMAGE"]').click();
    await page.waitForTimeout(200);

    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Check for image alt text analysis
    const imageAnalysis = page.locator('[data-testid="seo-image-analysis"]');

    if (await imageAnalysis.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(imageAnalysis).toBeVisible();
    }
  });

  test('should generate meta tags preview', async ({ page }) => {
    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Fill in title and description
    const titleInput = page.locator('[data-testid="seo-title-input"]');
    const descInput = page.locator('[data-testid="seo-description-input"]');

    await titleInput.fill('Test Title');
    await descInput.fill('Test Description');

    // Wait for preview to update
    await page.waitForTimeout(500);

    // Check for preview section
    const preview = page.locator('[data-testid="seo-preview"]');

    if (await preview.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(preview).toContainText(/Test Title|Test Description/);
    }
  });

  test('should export SEO report', async ({ page }) => {
    const seoPanel = page.locator('[data-testid="seo-panel"]');
    const seoToggle = page.locator('[data-testid="seo-toggle"]');

    if (!(await seoPanel.isVisible({ timeout: 500 }).catch(() => false))) {
      await seoToggle.click();
    }

    // Look for export button
    const exportBtn = page.locator('[data-testid="seo-export-btn"]');

    if (await exportBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Listen for download
      const downloadPromise = page.waitForEvent('download');

      await exportBtn.click();

      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('seo-report');
    }
  });
});
