import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";
import {
  suggestRhymeImprovements,
  suggestMeterImprovements,
  suggestImageryImprovements,
} from "../analysis.js";

const composer = new Composer<Ctx>();

const focusButtons = inlineKeyboard([
  [inlineButton("Rhyme", "improve:focus:rhyme"), inlineButton("Meter", "improve:focus:meter")],
  [inlineButton("Imagery", "improve:focus:imagery")],
]);

const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

composer.callbackQuery("improve:rhyme", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_improve_text";
  await ctx.reply("Paste the text you'd like to improve.", {
    reply_markup: { force_reply: true, input_field_placeholder: "Paste your text here…" },
  });
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_improve_text") return next();

  const text = ctx.message.text.trim();
  ctx.session.improveText = text;
  ctx.session.step = "improve_choosing_focus";

  if (text.length > 4000) {
    await ctx.reply("That's a bit long — try pasting a shorter excerpt (under 4,000 characters).", {
      reply_markup: backToMenu,
    });
    ctx.session.step = "menu";
    return;
  }

  await ctx.reply("What should I focus on?", { reply_markup: focusButtons });
});

function formatSuggestions(
  suggestions: Array<{ original: string; suggestion: string; explanation: string }>,
  focusLabel: string,
): string {
  if (suggestions.length === 0) {
    return `Looks great! No ${focusLabel} issues found — keep writing.`;
  }
  const items = suggestions
    .map((s) => `✨ ${s.original} → ${s.suggestion}\n${s.explanation}`)
    .join("\n\n");
  return `Here are some ${focusLabel} suggestions:\n\n${items}\n\nTap another focus area to explore more, or go back to the menu.`;
}

composer.callbackQuery(/^improve:focus:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const focus = ctx.match![1];
  const text = ctx.session.improveText ?? "";
  ctx.session.step = "menu";

  let suggestions: Array<{ original: string; suggestion: string; explanation: string }>;
  let focusLabel: string;

  switch (focus) {
    case "rhyme":
      suggestions = suggestRhymeImprovements(text);
      focusLabel = "rhyme";
      break;
    case "meter":
      suggestions = suggestMeterImprovements(text);
      focusLabel = "meter";
      break;
    case "imagery":
      suggestions = suggestImageryImprovements(text);
      focusLabel = "imagery";
      break;
    default:
      suggestions = [];
      focusLabel = "general";
  }

  await ctx.reply(formatSuggestions(suggestions, focusLabel), { reply_markup: backToMenu });
});

export default composer;
