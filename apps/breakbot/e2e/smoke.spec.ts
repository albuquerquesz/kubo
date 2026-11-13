import { expect, test } from "@playwright/test";

test("menu leva à partida com HUD", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: /PUSH/ })).toBeVisible({ timeout: 30_000 });
	await expect(page.locator("canvas")).toBeVisible();

	await page.getByRole("button", { name: "Jogar" }).click();

	await expect(page).toHaveURL(/\/play$/);
	await expect(page.getByTestId("lives")).toHaveText("♥ 30");
	await expect(page.getByTestId("clock")).toHaveText(/^\d:\d\d$/);
	await expect(page.getByTestId("coins")).toHaveText("0");
});
