import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { getPrompts } from "../prompts.js";

const composer = new Composer<Ctx>();

const genreButtons = inlineKeyboard([
  [inlineButton("Poetry", "idea:genre:poetry"), inlineButton("Prose", "idea:genre:prose")],
  [inlineButton("Song", "idea:genre:song"), inlineButton("Other", "idea:genre:other")],
]);

const moodButtons = inlineKeyboard([
  [inlineButton("Joyful", "idea:mood:joyful"), inlineButton("Melancholy", "idea:mood:melancholy")],
  [inlineButton("Reflective", "idea:mood:reflective"), inlineButton("Bold", "idea:mood:bold")],
]);

const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

composer.callbackQuery("idea:generate", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "idea_choosing_genre";
  await ctx.reply("What genre are you writing in?", { reply_markup: genreButtons });
});

composer.callbackQuery(/^idea:genre:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const genre = ctx.match![1];
  ctx.session.ideaGenre = genre;
  ctx.session.step = "idea_choosing_mood";
  await ctx.reply("What mood should it capture?", { reply_markup: moodButtons });
});

composer.callbackQuery(/^idea:mood:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const mood = ctx.match![1];
  const genre = ctx.session.ideaGenre ?? "other";
  ctx.session.step = "menu";

  const prompts = getPrompts(genre, mood);
  const text =
    `Here are 3 prompts to spark your writing:\n\n` +
    prompts.map((p, i) => `${i + 1}. ${p}`).join("\n\n") +
    `\n\nTap another genre to try again, or go back to the menu.`;

  await ctx.reply(text, { reply_markup: backToMenu });
});

export default composer;
