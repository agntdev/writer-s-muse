import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { pieceStore, reviewStore, adminStore, nextPieceId, nextReviewId } from "../store.js";
import { analyzeText } from "../analysis.js";

const composer = new Composer<Ctx>();

const typeButtons = inlineKeyboard([
  [
    inlineButton("Poem", "review:type:poem"),
    inlineButton("Prose", "review:type:prose"),
  ],
  [inlineButton("Song lyrics", "review:type:song")],
]);

const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

composer.callbackQuery("review:request", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_review_text";
  await ctx.reply("Paste the piece you'd like reviewed.", {
    reply_markup: { force_reply: true, input_field_placeholder: "Paste your piece here…" },
  });
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_review_text") return next();

  const text = ctx.message.text.trim();
  ctx.session.reviewText = text;
  ctx.session.step = "review_choosing_type";

  if (text.length > 4000) {
    await ctx.reply("That's a bit long — try pasting a shorter excerpt (under 4,000 characters).", {
      reply_markup: backToMenu,
    });
    ctx.session.step = "menu";
    return;
  }

  await ctx.reply("What kind of piece is this?", { reply_markup: typeButtons });
});

composer.callbackQuery(/^review:type:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const type = ctx.match![1];
  const text = ctx.session.reviewText ?? "";
  const userId = ctx.from!.id;
  ctx.session.step = "menu";

  const analysis = analyzeText(text);

  const pieceId = nextPieceId();
  await pieceStore.set(pieceId, {
    id: pieceId,
    userId,
    text,
    lang: "en",
    type,
    timestamp: Date.now(),
    analysisResult: JSON.stringify(analysis),
  });

  const reviewId = nextReviewId();
  await reviewStore.set(reviewId, {
    id: reviewId,
    pieceId,
    userId,
    status: "pending",
    timestamp: Date.now(),
  });

  const admin = await adminStore.get("primary");
  if (admin) {
    const adminMsg =
      `📬 New review submission\n\n` +
      `From: ${ctx.from!.first_name} (${userId})\n` +
      `Type: ${type}\n` +
      `Lines: ${analysis.lineCount}\n` +
      `Rhyme scheme: ${analysis.rhymeScheme}\n\n` +
      `---\n\n` +
      text;

    try {
      await ctx.api.sendMessage(admin.telegramId, adminMsg);
    } catch {
      // Admin may not have started the bot — log silently, don't abort.
    }
  }

  await ctx.reply(
    "Got it! I've sent your piece to our review team. You'll hear back soon.\n\nTap another button to keep writing!",
    { reply_markup: backToMenu },
  );
});

export default composer;
