import { test, expect } from '@playwright/test';

test('basic functionality test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('AsyncAPI Message Validator');
});
