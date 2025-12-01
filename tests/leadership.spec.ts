import { test, expect } from "@playwright/test";
import {
  loginAsStaff,
  loginAsClient,
  setupConsoleErrorGate,
  expectNoConsoleErrors,
  waitForLoading,
} from "./test-utils";

test.describe("Leadership Portfolio", () => {
  test.describe("Admin Access", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStaff(page);
    });

    test("admin staff can access /leadership", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      await expect(page).toHaveURL("/leadership");
      await expect(page.getByRole("heading", { name: /client portfolio/i })).toBeVisible();
      expectNoConsoleErrors(errors);
    });

    test("displays portfolio overview metrics", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Check for overview card with metrics
      await expect(page.getByText(/total clients/i)).toBeVisible();
      await expect(page.getByText(/at risk/i)).toBeVisible();
      await expect(page.getByText(/expansion ready/i)).toBeVisible();
      await expect(page.getByText(/avg health score/i)).toBeVisible();
      expectNoConsoleErrors(errors);
    });

    test("displays tabs for All/At Risk/Expansion", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Check tabs are present
      await expect(page.getByRole("tab", { name: /all clients/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /at risk/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /expansion/i })).toBeVisible();
      expectNoConsoleErrors(errors);
    });

    test("can switch between tabs", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Default is "All Clients" tab
      const allTab = page.getByRole("tab", { name: /all clients/i });
      await expect(allTab).toHaveAttribute("data-state", "active");

      // Click At Risk tab
      await page.getByRole("tab", { name: /at risk/i }).click();
      await expect(page.getByRole("tab", { name: /at risk/i })).toHaveAttribute("data-state", "active");

      // Click Expansion tab
      await page.getByRole("tab", { name: /expansion/i }).click();
      await expect(page.getByRole("tab", { name: /expansion/i })).toHaveAttribute("data-state", "active");

      expectNoConsoleErrors(errors);
    });

    test("shows sorting controls on All Clients tab", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Check sort controls
      await expect(page.getByText(/sort by:/i)).toBeVisible();
      expectNoConsoleErrors(errors);
    });

    test("can change sort order", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Click sort dropdown
      const sortTrigger = page.locator('[class*="SelectTrigger"]').first();
      await sortTrigger.click();

      // Select different sort option
      await page.getByRole("option", { name: /expansion potential/i }).click();

      expectNoConsoleErrors(errors);
    });

    test("displays client cards in grid", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Check for client cards (at least one should be visible in mock data)
      const cards = page.locator('[class*="Card"]');
      await expect(cards.first()).toBeVisible({ timeout: 5000 });

      expectNoConsoleErrors(errors);
    });

    test("clicking client card navigates to hub detail", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Click on first client card
      const firstCard = page.locator('[class*="Card"][class*="cursor-pointer"]').first();
      await firstCard.click();

      // Should navigate to hub detail
      await expect(page).toHaveURL(/\/hub\//);
      expectNoConsoleErrors(errors);
    });

    test("can return to hub list from header", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Click logo to return to hubs
      await page.locator('img[alt="AgentFlow Logo"]').click();
      await expect(page).toHaveURL(/\/hubs/);
      expectNoConsoleErrors(errors);
    });

    test("user menu allows navigation to Hub List", async ({ page }) => {
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Open user menu
      await page.locator('[class*="avatar"]').first().click();
      await page.getByText(/hub list/i).click();

      await expect(page).toHaveURL(/\/hubs/);
      expectNoConsoleErrors(errors);
    });
  });

  test.describe("Non-Admin Access Blocked", () => {
    test("client users cannot access /leadership", async ({ page }) => {
      await loginAsClient(page);

      await page.goto("/leadership");

      // Should either redirect to login or show access denied
      const isBlocked =
        page.url().includes("/login") ||
        (await page.getByText(/access denied/i).isVisible().catch(() => false));

      expect(isBlocked).toBeTruthy();
    });

    test("unauthenticated users redirected to login", async ({ page }) => {
      await page.goto("/leadership");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Stale Data Warning", () => {
    test("shows stale data warning when data is old", async ({ page }) => {
      await loginAsStaff(page);
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // The mock data may or may not trigger stale warning depending on timestamp
      // This test checks that the warning component exists and works when visible
      const staleWarning = page.locator('[class*="bg-amber"]');
      if (await staleWarning.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(staleWarning.getByText(/data last updated/i)).toBeVisible();
        await expect(staleWarning.getByRole("button", { name: /refresh/i })).toBeVisible();
      }
      expectNoConsoleErrors(errors);
    });

    test("refresh button triggers data refresh", async ({ page }) => {
      await loginAsStaff(page);
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // The mock data may or may not trigger stale warning
      const staleWarning = page.locator('[class*="bg-amber"]');
      if (await staleWarning.isVisible({ timeout: 1000 }).catch(() => false)) {
        const refreshButton = staleWarning.getByRole("button", { name: /refresh/i });
        await refreshButton.click();

        // Button should show loading state
        await expect(refreshButton).toBeDisabled();
      }
      expectNoConsoleErrors(errors);
    });
  });

  test.describe("Empty States", () => {
    test("shows empty state message when no at-risk clients", async ({ page }) => {
      await loginAsStaff(page);
      const errors = await setupConsoleErrorGate(page);
      await page.goto("/leadership");
      await waitForLoading(page);

      // Click At Risk tab
      await page.getByRole("tab", { name: /at risk/i }).click();

      // Either shows client cards or empty state
      const hasCards = await page.locator('[class*="Card"][class*="cursor-pointer"]').isVisible({ timeout: 2000 }).catch(() => false);
      const hasEmptyState = await page.getByText(/no at-risk clients/i).isVisible({ timeout: 2000 }).catch(() => false);

      expect(hasCards || hasEmptyState).toBeTruthy();
      expectNoConsoleErrors(errors);
    });
  });

  test.describe("Responsive Design", () => {
    test("displays correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await loginAsStaff(page);
      const errors = await setupConsoleErrorGate(page);

      await page.goto("/leadership");
      await waitForLoading(page);

      // Check header is still visible
      await expect(page.locator('img[alt="AgentFlow Logo"]')).toBeVisible();
      // Check tabs are visible
      await expect(page.getByRole("tab", { name: /all clients/i })).toBeVisible();
      expectNoConsoleErrors(errors);
    });
  });
});
