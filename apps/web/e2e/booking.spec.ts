import { test, expect } from '@playwright/test';

test.describe('Booking flow', () => {
  test('home page loads and links to search', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Blooso' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Find a business' })).toBeVisible();
  });

  test('search page loads', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
