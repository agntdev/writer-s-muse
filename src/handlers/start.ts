import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, mainMenuKeyboard } from "../toolkit/index.js";
import { userStore } from "../store.js";

registerMainMenuItem({ label: "💡 Get idea", data: "idea:generate", order: 10 });
registerMainMenuItem({ label: "🎵 Check rhythm", data: "check:rhythm", order: 20 });
registerMainMenuItem({ label: "✨ Improve rhyme", data: "improve:rhyme", order: 30 });
registerMainMenuItem({ label: "📝 Request review", data: "review:request", order: 40 });

const composer = new Composer<Ctx>();

const WELCOME =
  "👋 Welcome to Writer's Muse!\n\nTap a button below to spark your next piece.";

composer.command("start", async (ctx) => {
  ctx.session.step = "menu";
  const from = ctx.from;
  if (from) {
    await userStore.set(String(from.id), {
      userId: from.id,
      displayName: from.first_name,
    });
  }
  await ctx.reply(WELCOME, { reply_markup: mainMenuKeyboard() });
});

composer.command("cancel", async (ctx) => {
  ctx.session.step = "menu";
  await ctx.reply("No worries — cancelled. Tap a button to start something new.", {
    reply_markup: mainMenuKeyboard(),
  });
});

composer.callbackQuery("menu:main", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "menu";
  await ctx.editMessageText(WELCOME, { reply_markup: mainMenuKeyboard() });
});

export default composer;
