import { expect, test } from "@playwright/test";

test("sandbox: invocar, gastar ação, encerrar turno e causar dano", async ({ page }) => {
  await page.goto("/?scripted=1");
  await page.getByTestId("start-duel").click();

  await expect(page.getByTestId("active-hand")).toBeVisible();
  await expect(page.getByTestId("hand-card")).toHaveCount(5);
  await expect(page.getByTestId("actions-remaining")).toContainText("3 / 3");

  await page.getByTestId("hand-card").first().click();
  await page.getByTestId("action-SUMMON_UNIT").click();
  await page.getByTestId("unit-slot-p1-0").click();

  await expect(page.getByTestId("actions-remaining")).toContainText("2 / 3");
  await expect(page.getByTestId("event-log")).toContainText("Invocado");

  await page.getByTestId("end-turn").click();
  await expect(page.getByTestId("active-panel")).toContainText("Magos Umbrais");

  await page.getByTestId("hand-card").first().click();
  await page.getByTestId("action-SUMMON_UNIT").click();
  await page.getByTestId("unit-slot-p2-0").click();
  await page.getByTestId("end-turn").click();

  await expect(page.getByTestId("active-panel")).toContainText("Bestas de Fogo");
  await page.getByTestId("unit-slot-p1-0").click();
  await page.getByTestId("action-DECLARE_ATTACK").first().click();
  await page.getByTestId("unit-slot-p2-0").click();

  await expect(page.getByTestId("event-log")).toContainText("dano");
  await expect(page.getByTestId("opponent-panel")).toContainText("PV");
});
