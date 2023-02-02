import test, { expect } from "@playwright/test";

test.describe("on index page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://idleforces.com");
  });

  test("clicking load this save or make a new game save enters game", async ({
    page,
  }) => {
    await page.getByPlaceholder("Enter save name").fill("name");
    await page.getByPlaceholder("Enter your handle").fill("handle");
    await page.getByRole("button", { name: "Make a new game save" }).click();
    await page.getByRole("link", { name: "Idleforces" }).click();
    await page.getByRole("button", { name: "Load save name" }).click();
    await expect(page).toHaveURL("https://idleforces.com/game/dashboard");
  });

  test("deleting a save deletes a respective save", async ({ page }) => {
    await page.getByPlaceholder("Enter save name").fill("name");
    await page.getByPlaceholder("Enter your handle").fill("handle");
    await page.getByRole("button", { name: "Make a new game save" }).click();
    await page.getByRole("link", { name: "Idleforces" }).click();
    await page.getByPlaceholder("Enter save name").fill("secondName");
    await page.getByPlaceholder("Enter your handle").fill("secondHandle");
    await page.getByRole("button", { name: "Make a new game save" }).click();
    await page.getByRole("link", { name: "Idleforces" }).click();
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      dialog.accept().catch(() => {});
    });
    await page.getByRole("button", { name: "Delete save secondName" }).click();

    await expect(page.getByText("name", { exact: true })).toHaveText("name");
    expect(await page.getByText("secondName").count()).toEqual(0);
  });
});
