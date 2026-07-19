import { expect, test } from "@playwright/test";

async function signInAsMarti(page: import("@playwright/test").Page) {
  await page.goto("/auth/sign-in");
  await page.getByRole("button", { name: "Continue as Marti" }).click();
  await expect(page).toHaveURL(/\/overview$/);
}

test.describe("slice #4 — card statements", () => {
  test("card detail shows seeded statements and create flow", async ({
    page,
  }) => {
    await signInAsMarti(page);
    await page.getByRole("link", { name: "Cards", exact: true }).click();
    await expect(page).toHaveURL(/\/cards$/);

    await page.getByRole("link", { name: "Amazon Visa" }).click();
    await expect(page).toHaveURL(/\/cards\/[^/]+\/statements$/);
    await expect(
      page.getByRole("heading", { name: "Statements", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Closing balance")).toBeVisible();

    await page.getByRole("link", { name: "+ Add statement" }).click();
    await expect(page).toHaveURL(/\/statements\/new$/);
    await expect(
      page.getByRole("heading", { name: "Add statement", exact: true }),
    ).toBeVisible();

    // Unique period each run so re-runs don't hit the unique constraint.
    const day = String((Date.now() % 27) + 1).padStart(2, "0");
    const periodStart = `2028-01-${day}`;
    const periodEnd = `2028-02-${day}`;

    await page.locator('input[name="periodStart"]').fill(periodStart);
    await page.locator('input[name="periodEnd"]').fill(periodEnd);
    await page.locator('input[name="closingBalance"]').fill("8150.25");
    await page.locator('input[name="minimumPayment"]').fill("165");
    await page.locator('input[name="paymentDueDate"]').fill(periodEnd);
    await page.getByRole("button", { name: "Save statement" }).click();

    await expect(page).toHaveURL(/\/cards\/[^/]+\/statements$/);
    await expect(page.getByText(`Jan ${Number(day)}, 2028`)).toBeVisible();
  });

  test("unknown card statements URL is blocked", async ({ page }) => {
    await signInAsMarti(page);
    const response = await page.goto(
      "/cards/cmfakeotherhousehold000000001/statements",
    );
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/could not be found|not found/i)).toBeVisible();
  });
});
