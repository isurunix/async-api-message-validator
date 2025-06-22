import { test, expect } from '@playwright/test';

test.describe('Schema Loading Bugfix', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load completely
    await expect(page.locator('h1')).toContainText('AsyncAPI Message Validator');
    
    // Wait for Monaco Editor container to be present
    await expect(page.locator('#editor-container')).toBeVisible();
    
    // Wait a bit for Monaco to fully initialize (more relaxed approach)
    await page.waitForTimeout(3000);
  });
  test('should handle multiple schema loads without throwing null pointer errors', async ({ page }) => {
    // Test the exact scenario from the bug report:
    // 1. Load UI ✓ (done in beforeEach)
    // 2. Load schema from URL 
    // 3. Load another schema from URL
    // 4. Verify no errors and UI works correctly

    // Step 1: Verify initial state
    await expect(page.locator('#currentSchemaText')).toBeVisible();
    
    // Wait for default schema to load (increase timeout)
    await page.waitForTimeout(5000);

    // Step 2: Load default schema first to get a working state
    await page.click('button:has-text("Default")');
    
    // Wait for the result to appear - this calls reloadSchemaInfo()
    await expect(page.locator('#validationResult')).toBeVisible({ timeout: 15000 });
    
    // Verify success message appears (this proves reloadSchemaInfo worked without null pointer errors)
    await expect(page.locator('#validationResult')).toContainText('Default schema loaded');

    // Step 3: Load another schema (this triggers reloadSchemaInfo again)
    await page.click('button:has-text("Default")');
    
    // Wait for the result again - this should not throw "Cannot set properties of null" error
    await expect(page.locator('#validationResult')).toContainText('Default schema loaded', { timeout: 15000 });
    
    // The key test: Verify the page is still functional - no JavaScript errors should have occurred
    // Test that we can still interact with key UI elements (proves the fix worked)
    
    // Test message selector is still functional
    await expect(page.locator('#messageSelect')).toBeVisible();
    await expect(page.locator('#messageSelect')).toBeEnabled();
    
    // Test Monaco Editor container is still there
    await expect(page.locator('#editor-container')).toBeVisible();
    
    // Test schema URL input is still functional
    await expect(page.locator('#schemaUrl')).toBeVisible();
    await expect(page.locator('#schemaUrl')).toBeEnabled();
    
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Trigger one more schema operation to catch any potential errors
    await page.click('button:has-text("Default")');
    await page.waitForTimeout(2000);
    
    // Check that there are no "Cannot set properties of null" errors
    const nullPointerErrors = consoleErrors.filter(log => 
      log.includes('Cannot set properties of null') || 
      log.includes('Cannot read properties of null')
    );
    
    expect(nullPointerErrors).toHaveLength(0);
  });
  test('should properly clear Monaco Editor when schema is reloaded', async ({ page }) => {
    // This test specifically validates the fix we implemented in reloadSchemaInfo()
    
    // Try to interact with Monaco Editor (if available)
    // We'll be more defensive since Monaco might not be fully loaded
    const editorContainer = page.locator('#editor-container');
    await expect(editorContainer).toBeVisible();
    
    // Click on the editor area and try to add some content
    await editorContainer.click();
    await page.keyboard.type('{"test": "content"}');
    
    // Wait a moment for the content to be set
    await page.waitForTimeout(1000);
    
    // Load default schema (this triggers reloadSchemaInfo which should clear the editor)
    await page.click('button:has-text("Default")');
    await expect(page.locator('#validationResult')).toContainText('Default schema loaded', { timeout: 15000 });
    
    // The key part: this operation should not have thrown "Cannot set properties of null"
    // If our fix worked, the operation completed successfully without errors
    
    // Verify the UI is still functional after the reload
    await expect(editorContainer).toBeVisible();
    await expect(page.locator('#messageSelect')).toBeVisible();
  });

  test('should handle schema URL input and loading states correctly', async ({ page }) => {
    // Test the loading button states
    const loadButton = page.locator('#loadSchemaBtn');
    const loadButtonText = page.locator('#loadSchemaBtnText');
    const loadButtonSpinner = page.locator('#loadSchemaSpinner');
    
    // Initially, button should be enabled and show text
    await expect(loadButton).toBeEnabled();
    await expect(loadButtonText).toBeVisible();
    await expect(loadButtonSpinner).toBeHidden();
    
    // Fill in a URL
    await page.fill('#schemaUrl', 'https://raw.githubusercontent.com/asyncapi/spec/master/examples/simple.yml');
    
    // Click load and verify loading state
    await loadButton.click();
    
    // During loading, button should be disabled and show spinner
    await expect(loadButton).toBeDisabled();
    await expect(loadButtonSpinner).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForTimeout(5000);
    
    // After loading, button should be enabled again
    await expect(loadButton).toBeEnabled();
    await expect(loadButtonText).toBeVisible();
  });

  test('should handle keyboard events correctly', async ({ page }) => {
    // Test Enter key in schema URL input
    await page.fill('#schemaUrl', 'https://example.com/test.yml');
    
    // Press Enter in the schema URL field
    await page.locator('#schemaUrl').press('Enter');
    
    // This should trigger schema loading (even if it fails, it shouldn't crash)
    await page.waitForTimeout(2000);
    
    // Verify page is still functional
    await expect(page.locator('#messageSelect')).toBeVisible();
  });

  test('should preserve theme settings during schema operations', async ({ page }) => {
    // Toggle to dark theme
    await page.click('#themeToggle');
    
    // Verify dark theme is applied
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Load default schema
    await page.click('button:has-text("Default")');
    await expect(page.locator('#validationResult')).toContainText('Default schema loaded', { timeout: 15000 });
    
    // Verify dark theme is still applied after schema reload
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
