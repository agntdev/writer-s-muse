import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, mainMenuKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "💡 Get idea", data: "idea:generate", order: 10 });
registerMainMenuItem({ label: "🎵 Check rhythm", data: "check:rhythm", order: 20 });
registerMainMenuItem({ label: "✨ Improve rhyme", data: "improve:rhyme", order: 30 });
registerMainMenuItem({ label: "📝 Request review", data: "review:request", order: 40 });

const composer = new Composer<Ctx>();

const WELCOME =
  "👋 Welcome to Writer's Muse!\n\nTap a button below to spark your next piece.";

composer.command("start", async (ctx) => {
  ctx.session.step = "menu";
  await ctx.reply(WELCOME, { reply_markup: mainMenuKeyboard() });
});

composer.callbackQuery("menu:main", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "menu";
  await ctx.editMessageText(WELCOME, { reply_markup: mainMenuKeyboard() });
});

export default composer;
