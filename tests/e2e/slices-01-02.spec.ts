import { expect, test } from "@playwright/test";

async function signInAsMarti(page: import("@playwright/test").Page) {
  await page.goto("/auth/sign-in");
  await page.getByRole("button", { name: "Continue as Marti" }).click();
  await expect(page).toHaveURL(/\/overview$/);
}

test.describe("slice #1 — auth → overview → cards", () => {
  test("demo sign-in lands on overview with portfolio metrics", async ({
    page,
  }) => {
    await signInAsMarti(page);
    await expect(
      page.getByRole("heading", { name: "Overview", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Total balance")).toBeVisible();
    await expect(page.getByText("Available credit")).toBeVisible();
    await expect(page.getByText("Overall utilization")).toBeVisible();
  });

  test("cards table lists seeded household cards", async ({ page }) => {
    await signInAsMarti(page);
    await page.getByRole("link", { name: "Cards", exact: true }).click();
    await expect(page).toHaveURL(/\/cards$/);
    await expect(
      page.getByRole("heading", { name: "Credit cards", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Amazon Visa")).toBeVisible();
    await expect(page.getByText("Best Buy/CitiBank Visa")).toBeVisible();
  });
});

test.describe("slice #2 — paydown + promo panels", () => {
  test("overview shows paydown priority and promo payoff panels", async ({
    page,
  }) => {
    await signInAsMarti(page);
    await expect(
      page.getByRole("heading", { name: "Paydown priority" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "0% promo payoff plan" }),
    ).toBeVisible();
  });
});
