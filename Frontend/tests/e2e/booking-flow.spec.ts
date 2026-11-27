import { expect, test } from "@playwright/test";

test("complete CineView demo booking flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Dune: Part Two/i })).toBeVisible();

  // Navigate to Movies catalog and filter
  await page.getByRole("link", { name: "Movies" }).first().click();
  await expect(page).toHaveURL(/\/movies/);
  await page.getByPlaceholder(/Filter by title/i).fill("Dune: Part Two");
  await expect(page.getByText("Dune: Part Two")).toBeVisible();

  // Open Movie Details -> 3D Seat Selection
  await page.getByRole("link", { name: /Book Seats/i }).first().click();
  await expect(page).toHaveURL(/\/movies\/mov-dune-part-two/, { timeout: 15000 });
  await page.getByRole("link", { name: /Book Tickets & 3D Seat Preview/i }).click();
  await expect(page).toHaveURL(/\/seats\//, { timeout: 15000 });

  // Select first available seat on 2D map
  const availableSeat = page.locator("button[aria-label*='available']").first();
  await availableSeat.click();
  await expect(page.getByRole("button", { name: /Proceed to Checkout/i })).toBeVisible();

  // Proceed to Checkout
  await page.getByRole("button", { name: /Proceed to Checkout/i }).click();
  await expect(page).toHaveURL(/\/checkout/, { timeout: 15000 });

  // Complete Booking
  await page.getByRole("button", { name: /Complete Booking/i }).click();
  await expect(page).toHaveURL(/\/confirmation\//, { timeout: 15000 });
  await expect(page.getByText(/You're All Set!/i)).toBeVisible();

  // View Digital Ticket
  await page.getByRole("link", { name: /View Digital Ticket/i }).click();
  await expect(page).toHaveURL(/\/tickets\//, { timeout: 15000 });
  await expect(page.getByText(/Demo Reference Only/i)).toBeVisible();
});
