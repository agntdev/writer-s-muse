import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { analyzeText } from "../analysis.js";
import { pieceStore, nextPieceId } from "../store.js";

const composer = new Composer<Ctx>();

const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

composer.callbackQuery("check:rhythm", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_rhythm_text";
  await ctx.reply("Paste your poem or verse below — I'll check its rhythm and rhyme scheme.", {
    reply_markup: { force_reply: true, input_field_placeholder: "Paste your poem here…" },
  });
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_rhythm_text") return next();

  const text = ctx.message.text.trim();
  ctx.session.step = "menu";

  if (text.length > 4000) {
    await ctx.reply("That's a bit long — try pasting a shorter excerpt (under 4,000 characters).", {
      reply_markup: backToMenu,
    });
    return;
  }

  const result = analyzeText(text);

  const sylLine = result.syllableCounts.map((c, i) => `  Line ${i + 1}: ${c} syllables`).join("\n");
  const sugLines = result.suggestions.map((s) => `• ${s}`).join("\n");

  const response =
    `📊 Rhythm analysis\n\n` +
    `Lines: ${result.lineCount}\n` +
    `Avg syllables/line: ${result.avgSyllables}\n` +
    `Rhyme scheme: ${result.rhymeScheme}\n\n` +
    `Syllable breakdown:\n${sylLine}\n\n` +
    `💡 Suggestions\n${sugLines}`;

  const pieceId = nextPieceId();
  await pieceStore.set(pieceId, {
    id: pieceId,
    userId: ctx.from!.id,
    text,
    lang: "en",
    type: "poem",
    timestamp: Date.now(),
    analysisResult: JSON.stringify(result),
  });

  await ctx.reply(response, { reply_markup: backToMenu });
});

export default composer;
