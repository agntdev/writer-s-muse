import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

const HELP =
  "📖 Writer's Muse — your writing companion\n\n" +
  "Tap /start to open the menu, then pick what you want from the buttons.\n\n" +
  "• 💡 Get idea — writing prompts for any genre\n" +
  "• 🎵 Check rhythm — analyze meter and rhyme\n" +
  "• ✨ Improve rhyme — get suggestions for your text\n" +
  "• 📝 Request review — send your work for human feedback";

const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

composer.command("help", async (ctx) => {
  await ctx.reply(HELP);
});

composer.callbackQuery("menu:help", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(HELP, { reply_markup: backToMenu });
});

export default composer;
