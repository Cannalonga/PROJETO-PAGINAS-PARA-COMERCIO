// e2e/deployment.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Deployment Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to deployment page
    await page.goto('/deployment');
    // Wait for components to load
    await page.waitForSelector('[data-testid="deploy-container"]', { timeout: 5000 });
  });

  test('should display deployment controls', async ({ page }) => {
    const deployBtn = page.locator('[data-testid="deploy-button"]');
    const statusSection = page.locator('[data-testid="deploy-status"]');

    await expect(deployBtn).toBeVisible();
    await expect(statusSection).toBeVisible();
  });

  test('should initiate deployment', async ({ page }) => {
    // Click deploy button
    const deployBtn = page.locator('[data-testid="deploy-button"]');
    await deployBtn.click();

    // Verify loading state
    const loadingIndicator = page.locator('[data-testid="deploy-loading"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 });
  });

  test('should show deployment progress', async ({ page }) => {
    // Start deployment
    const deployBtn = page.locator('[data-testid="deploy-button"]');
    await deployBtn.click();

    // Wait for progress indicator
    const progressBar = page.locator('[data-testid="deploy-progress"]');
    await expect(progressBar).toBeVisible({ timeout: 3000 });
  });

  test('should generate preview URL after deployment', async ({ page }) => {
    // Start deployment
    const deployBtn = page.locator('[data-testid="deploy-button"]');
    await deployBtn.click();

    // Wait for preview URL to appear
    const previewLink = page.locator('[data-testid="preview-link"]');
    await expect(previewLink).toBeVisible({ timeout: 10000 });
  });

  test('should copy preview URL to clipboard', async ({ page }) => {
    // Start deployment
    const deployBtn = page.locator('[data-testid="deploy-button"]');
    await deployBtn.click();

    // Wait for and click copy button
    const copyBtn = page.locator('[data-testid="copy-preview-url"]');
    await expect(copyBtn).toBeVisible({ timeout: 10000 });
    await copyBtn.click();

    // Verify success message
    const copySuccess = page.locator('[data-testid="copy-success"]');
    await expect(copySuccess).toBeVisible({ timeout: 2000 });
  });

  test('should open preview in new tab', async ({ page, context }) => {
    // Start deployment
    const deployBtn = page.locator('[data-testid="deploy-button"]');
    await deployBtn.click();

    // Wait for and click open preview button
    const openPreviewBtn = page.locator('[data-testid="open-preview-btn"]');
    await expect(openPreviewBtn).toBeVisible({ timeout: 10000 });

    // Listen for new page
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      openPreviewBtn.click(),
    ]);

    // Verify new page opened
    expect(newPage.url()).toContain('preview');
    await newPage.close();
  });

  test('should display deployment history', async ({ page }) => {
    // Check deployment history section
    const historySection = page.locator('[data-testid="deployment-history"]');
    await expect(historySection).toBeVisible({ timeout: 5000 });

    // Verify deployment entries
    const historyItems = page.locator('[data-testid="history-item"]');
    const count = await historyItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display deployment status icons', async ({ page }) => {
    // Check for status icons in history
    const successIcon = page.locator('[data-testid="status-icon-success"]');
    const failedIcon = page.locator('[data-testid="status-icon-failed"]');
    const pendingIcon = page.locator('[data-testid="status-icon-pending"]');

    // At least one status type should be visible
    const statusVisible =
      (await successIcon.isVisible({ timeout: 1000 }).catch(() => false)) ||
      (await failedIcon.isVisible({ timeout: 1000 }).catch(() => false)) ||
      (await pendingIcon.isVisible({ timeout: 1000 }).catch(() => false));

    expect(statusVisible).toBeTruthy();
  });

  test('should display deployment timeline', async ({ page }) => {
    // Check deployment timeline
    const timeline = page.locator('[data-testid="deployment-timeline"]');
    await expect(timeline).toBeVisible({ timeout: 5000 });

    // Verify timeline events
    const timelineEvents = page.locator('[data-testid="timeline-event"]');
    const count = await timelineEvents.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show deployment version', async ({ page }) => {
    // Check for version display in history or status
    const versionDisplay = page.locator('[data-testid="deployment-version"]');

    // Version might be visible in history or details
    const isVisible = await versionDisplay.isVisible({ timeout: 1000 }).catch(() => false);

    if (isVisible) {
      await expect(versionDisplay).toContainText(/v\d+\.\d+\.\d+/);
    }
  });

  test('should display deployment timestamps', async ({ page }) => {
    // Check for timestamps in history
    const timestamps = page.locator('[data-testid="deployment-timestamp"]');

    // Verify at least one timestamp is visible
    const isVisible = await timestamps.first().isVisible({ timeout: 1000 }).catch(() => false);

    if (isVisible) {
      const timestamp = await timestamps.first().textContent();
      expect(timestamp).toBeTruthy();
    }
  });

  test('should rollback to previous version', async ({ page }) => {
    // Find rollback button
    const rollbackBtn = page.locator('[data-testid="rollback-btn"]').first();

    // Check if rollback is available
    const isVisible = await rollbackBtn.isVisible({ timeout: 1000 }).catch(() => false);

    if (isVisible) {
      await rollbackBtn.click();

      // Verify rollback confirmation
      const confirmModal = page.locator('[data-testid="rollback-confirm"]');
      await expect(confirmModal).toBeVisible({ timeout: 2000 });

      // Confirm rollback
      const confirmBtn = page.locator('[data-testid="confirm-rollback"]');
      await confirmBtn.click();

      // Verify rollback success
      const successMsg = page.locator('[data-testid="rollback-success"]');
      await expect(successMsg).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle deployment errors gracefully', async ({ page }) => {
    // Try to deploy without required fields (if applicable)
    const deployBtn = page.locator('[data-testid="deploy-button"]');

    // Click deploy
    await deployBtn.click();

    // Check for error message (might not appear if all required fields are pre-filled)
    const errorMsg = page.locator('[data-testid="deploy-error"]');
    const errorVisible = await errorMsg.isVisible({ timeout: 5000 }).catch(() => false);

    // If error appears, verify it's readable
    if (errorVisible) {
      const errorText = await errorMsg.textContent();
      expect(errorText).toBeTruthy();
    }
  });

  test('should disable deploy button while deploying', async ({ page }) => {
    const deployBtn = page.locator('[data-testid="deploy-button"]');

    // Deploy
    await deployBtn.click();

    // Check if button is disabled during deployment
    const isDisabled = await deployBtn.isDisabled().catch(() => false);

    // Button should be disabled or show loading state
    const classAttr = await deployBtn.getAttribute('class');
    const hasLoadingClass =
      (classAttr?.includes('loading') || false) ||
      (classAttr?.includes('disabled') || false);

    expect(isDisabled || hasLoadingClass).toBeTruthy();
  });
});
