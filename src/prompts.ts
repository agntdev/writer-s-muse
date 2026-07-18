type Genre = "poetry" | "prose" | "song" | "other";
type Mood = "joyful" | "melancholy" | "reflective" | "bold";

const PROMPTS: Record<Genre, Record<Mood, string[]>> = {
  poetry: {
    joyful: [
      "Describe the moment sunlight hits a dewdrop — in exactly eight lines.",
      "Write a sonnet where every line starts with a different color.",
      "Capture the feeling of dancing alone in your kitchen — no more than 12 lines.",
    ],
    melancholy: [
      "Write about a letter you never sent — let the imagery carry the weight.",
      "Describe autumn through the lens of a memory you can't quite reach.",
      "Give voice to the last leaf on a tree in late November.",
    ],
    reflective: [
      "Write a poem that begins and ends with the same word — but the meaning shifts.",
      "Describe who you were five years ago, as if writing a letter to them.",
      "Turn a daily routine into a meditation — six lines, each one a single breath.",
    ],
    bold: [
      "Write a manifesto in verse — twelve lines, no hedging.",
      "Channel a storm as metaphor for something you're fighting for.",
      "Write three stanzas that each end with a different command.",
    ],
  },
  prose: {
    joyful: [
      "Open a scene with someone laughing alone — and reveal why by the end.",
      "Describe a feast using only sounds and textures, no visuals.",
      "Write a paragraph where the last sentence recontextualizes the first.",
    ],
    melancholy: [
      "Write a scene set in a room after everyone has left.",
      "Describe the sound of rain on a window when you're waiting for news.",
      "Begin with 'The last time I saw them, they were…' and let it linger.",
    ],
    reflective: [
      "Write a moment where a character notices something they've walked past a hundred times.",
      "Describe a photograph without saying what the photograph is of.",
      "Write the silence between two people who both want to speak.",
    ],
    bold: [
      "Open mid-action — no setup, no context. The reader lands running.",
      "Write a paragraph where every sentence is a contradiction.",
      "Describe a choice someone makes in exactly five sentences.",
    ],
  },
  song: {
    joyful: [
      "Write a chorus that makes someone want to clap along — keep it under 8 lines.",
      "Turn a mundane errand into a celebration — verses and a hook.",
      "Write a bridge that shifts the energy from verse to final chorus.",
    ],
    melancholy: [
      "Write a verse about driving away from somewhere you loved.",
      "Compose a chorus that repeats but means something different the second time.",
      "Write lyrics that use weather as the only metaphor for a relationship.",
    ],
    reflective: [
      "Write a verse from the perspective of an object that holds a memory.",
      "Compose a song where each verse is a different year.",
      "Write a chorus that answers a question asked in the verse.",
    ],
    bold: [
      "Write a hook that's just three words — but it hits hard.",
      "Compose a verse that builds from a whisper to a shout.",
      "Write lyrics that break the fourth wall and address the listener directly.",
    ],
  },
  other: {
    joyful: [
      "Describe your perfect morning using only five senses — one per line.",
      "Write a list of small things that make life worth it.",
      "Capture a moment of unexpected kindness in under 100 words.",
    ],
    melancholy: [
      "Write about something beautiful that's also a little bit sad.",
      "Describe the feeling of finishing a great book — no more than 5 sentences.",
      "Write a short piece about something you miss without naming it.",
    ],
    reflective: [
      "Write a letter to your future self — keep it under 150 words.",
      "Describe a place that shaped you, using only present tense.",
      "Write about a choice that defined you — without explaining why.",
    ],
    bold: [
      "Write something that starts with 'What if…' and ends with a revelation.",
      "Describe a fear you've outgrown — in present tense, as if it's still real.",
      "Write a piece where every sentence starts with 'I'.",
    ],
  },
};

export function getPrompts(genre: string, mood: string): string[] {
  const g = (genre.toLowerCase() as Genre);
  const m = (mood.toLowerCase() as Mood);
  const genrePrompts = PROMPTS[g] ?? PROMPTS.other;
  return genrePrompts[m] ?? genrePrompts.reflective;
}
