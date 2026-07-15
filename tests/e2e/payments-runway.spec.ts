import { test, expect, type Page } from "@playwright/test";

async function signInAsMarti(page: Page) {
  await page.goto("/auth/sign-in");
  await page.getByRole("button", { name: /continue as marti/i }).click();
  await expect(page).toHaveURL(/\/overview$/);
}

test.describe("Payment runway (slice #3)", () => {
  test("runway page loads with generate button", async ({ page }) => {
    await signInAsMarti(page);
    await page.goto("/payments/runway");
    await expect(
      page.getByRole("heading", { name: "Payment runway" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /generate from cards/i }),
    ).toBeVisible();
  });

  test("generate from cards creates runway items", async ({ page }) => {
    await signInAsMarti(page);
    await page.goto("/payments/runway");
    await page.getByRole("button", { name: /generate from cards/i }).click();

    await page.waitForTimeout(2000);
    await page.reload();
    await expect(page.locator("table")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("tbody tr")).toHaveCount(3, { timeout: 5_000 });
  });

  test("make a payment button starts intent flow", async ({ page }) => {
    await signInAsMarti(page);
    await page.goto("/payments/runway");

    const table = page.locator("table");
    if (!(await table.isVisible())) {
      await page.getByRole("button", { name: /generate from cards/i }).click();
      await page.waitForTimeout(2000);
      await page.reload();
      await expect(table).toBeVisible({ timeout: 10_000 });
    }

    await page.getByRole("button", { name: /make a payment/i }).click();
    await expect(page).toHaveURL(/\/payments\/new\?intentId=/, {
      timeout: 10_000,
    });
    await expect(
      page.getByRole("heading", { name: "New payment" }),
    ).toBeVisible();
  });

  test("intent stepper shows card selection step", async ({ page }) => {
    await signInAsMarti(page);
    await page.goto("/payments/runway");

    const table = page.locator("table");
    if (!(await table.isVisible())) {
      await page.getByRole("button", { name: /generate from cards/i }).click();
      await page.waitForTimeout(2000);
      await page.reload();
      await expect(table).toBeVisible({ timeout: 10_000 });
    }

    await page.getByRole("button", { name: /make a payment/i }).click();
    await expect(page).toHaveURL(/\/payments\/new\?intentId=/, {
      timeout: 10_000,
    });

    await expect(page.getByText("Select a card to pay")).toBeVisible();
    await expect(page.getByText("Amazon Visa")).toBeVisible();
  });
});
