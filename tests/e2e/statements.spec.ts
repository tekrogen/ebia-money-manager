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

    await page.locator('input[name="periodStart"]').fill("2026-07-05");
    await page.locator('input[name="periodEnd"]').fill("2026-08-04");
    await page.locator('input[name="closingBalance"]').fill("8150.25");
    await page.locator('input[name="minimumPayment"]').fill("165");
    await page.locator('input[name="paymentDueDate"]').fill("2026-08-04");
    await page.getByRole("button", { name: "Save statement" }).click();

    await expect(page).toHaveURL(/\/cards\/[^/]+\/statements$/);
    await expect(page.getByText("Jul 5, 2026")).toBeVisible();
  });
});
