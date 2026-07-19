import { expect, test } from "@playwright/test";

async function signInAsMarti(page: import("@playwright/test").Page) {
  await page.goto("/auth/sign-in");
  await page.getByRole("button", { name: "Continue as Marti" }).click();
  await expect(page).toHaveURL(/\/overview$/);
}

test.describe("slice #5 — global search", () => {
  test("⌘K opens palette, finds card, and navigates", async ({ page }) => {
    await signInAsMarti(page);

    await page.keyboard.press("Meta+k");
    const dialog = page.getByRole("dialog", { name: "Search" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("combobox").fill("Amazon");

    const cardOption = dialog
      .getByRole("group", { name: "Cards" })
      .getByRole("option")
      .filter({ hasText: "Amazon Visa" });
    await expect(cardOption).toBeVisible({ timeout: 5000 });

    await cardOption.click();
    await expect(page).toHaveURL(/\/cards\/[^/]+$/);
  });

  test("Escape closes palette and restores focus to Search", async ({
    page,
  }) => {
    await signInAsMarti(page);

    const trigger = page.getByRole("button", { name: "Search" });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Search" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Search" })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
