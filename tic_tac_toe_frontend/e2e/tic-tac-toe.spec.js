const { test, expect } = require("@playwright/test");

/**
 * Helper to click a square by 1-based index using the app's aria-label ("Square N").
 * @param {import('@playwright/test').Page} page
 * @param {number} n1Based
 */
async function clickSquare(page, n1Based) {
  await page.getByRole("gridcell", { name: new RegExp(`^Square ${n1Based}\\b`, "i") }).click();
}

/**
 * Helper to read the mark in a square by 1-based index.
 * Uses aria-label that becomes "Square N: X" / "Square N: O".
 * @param {import('@playwright/test').Page} page
 * @param {number} n1Based
 * @returns {Promise<"X"|"O"|null>}
 */
async function getSquareValue(page, n1Based) {
  const cell = page.getByRole("gridcell", { name: new RegExp(`^Square ${n1Based}\\b`, "i") });
  const label = await cell.getAttribute("aria-label");
  if (!label) return null;
  if (label.includes(": X")) return "X";
  if (label.includes(": O")) return "O";
  return null;
}

test.describe("Tic Tac Toe (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /tic tac toe/i })).toBeVisible();
    await expect(page.getByRole("grid", { name: /tic tac toe board/i })).toBeVisible();
  });

  test("turn-taking alternates X then O and prevents overwriting a played square", async ({ page }) => {
    const status = page.getByRole("status");

    await expect(status).toContainText("Next player: X");

    // X plays square 1
    await clickSquare(page, 1);
    await expect(status).toContainText("Next player: O");
    await expect(await getSquareValue(page, 1)).toBe("X");

    // O plays square 2
    await clickSquare(page, 2);
    await expect(status).toContainText("Next player: X");
    await expect(await getSquareValue(page, 2)).toBe("O");

    // Attempt to click already-used square 1 again should do nothing
    await page.getByRole("gridcell", { name: /^Square 1\b/i }).click({ trial: false }).catch(() => {});
    await expect(await getSquareValue(page, 1)).toBe("X"); // unchanged
  });

  test("detects a win for X (top row) and disables further moves", async ({ page }) => {
    const status = page.getByRole("status");

    // X:1 O:4 X:2 O:5 X:3 -> X wins top row
    await clickSquare(page, 1);
    await clickSquare(page, 4);
    await clickSquare(page, 2);
    await clickSquare(page, 5);
    await clickSquare(page, 3);

    await expect(status).toHaveText(/Winner:\s*X/i);

    // Board should be disabled once there is a winner.
    // Example: square 9 should be disabled.
    await expect(page.getByRole("gridcell", { name: /^Square 9\b/i })).toBeDisabled();
  });

  test("detects a draw when the board fills with no winner", async ({ page }) => {
    const status = page.getByRole("status");

    // Sequence that results in a draw (no 3-in-a-row)
    // Board indices (1-based):
    // 1 2 3
    // 4 5 6
    // 7 8 9
    //
    // Moves: X1 O2 X3 O5 X4 O6 X8 O7 X9 => draw
    await clickSquare(page, 1); // X
    await clickSquare(page, 2); // O
    await clickSquare(page, 3); // X
    await clickSquare(page, 5); // O
    await clickSquare(page, 4); // X
    await clickSquare(page, 6); // O
    await clickSquare(page, 8); // X
    await clickSquare(page, 7); // O
    await clickSquare(page, 9); // X

    await expect(status).toHaveText(/It's a draw/i);
  });

  test("reset clears the board and returns to X's turn", async ({ page }) => {
    const status = page.getByRole("status");

    await clickSquare(page, 1); // X
    await clickSquare(page, 2); // O
    await expect(await getSquareValue(page, 1)).toBe("X");
    await expect(await getSquareValue(page, 2)).toBe("O");
    await expect(status).toContainText("Next player: X");

    await page.getByRole("button", { name: /reset game/i }).click();

    await expect(status).toContainText("Next player: X");
    for (let i = 1; i <= 9; i += 1) {
      await expect(await getSquareValue(page, i)).toBe(null);
    }

    // After reset, should be able to play again
    await clickSquare(page, 5);
    await expect(await getSquareValue(page, 5)).toBe("X");
    await expect(status).toContainText("Next player: O");
  });
});
