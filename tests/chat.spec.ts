import { test, expect } from "@playwright/test";
import { roomUrl, tapToListen, openSheetTab } from "./helpers";

test("a message sent by one listener appears for the other in real time", async ({
  browser,
}) => {
  const context = await browser.newContext();

  const pageA = await context.newPage();
  await pageA.goto(roomUrl("CHATRM", "ava-1", "Ava"));
  await tapToListen(pageA);
  await openSheetTab(pageA, "Chat");

  const pageB = await context.newPage();
  await pageB.goto(roomUrl("CHATRM", "bo-2", "Bo"));
  await tapToListen(pageB);
  await openSheetTab(pageB, "Chat");

  await expect(pageA.getByTestId("member")).toHaveCount(2, { timeout: 15000 });
  await expect(pageB.getByTestId("member")).toHaveCount(2, { timeout: 15000 });

  const messageText = "hello-from-ava-123";
  await pageA.getByPlaceholder("Message the room…").fill(messageText);
  await pageA.getByRole("button", { name: "Send" }).click();

  await expect(
    pageB.getByTestId("chat-message").filter({ hasText: messageText })
  ).toHaveCount(1, { timeout: 15000 });

  await expect(
    pageA.getByTestId("chat-message").filter({ hasText: messageText })
  ).toHaveCount(1, { timeout: 15000 });

  await context.close();
});
