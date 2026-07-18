const VOWELS = "aeiouyàáâãäåèéêëìíîïòóôõöùúûüýÿ";

function countWordSyllables(word: string): number {
  word = word.replace(/[^a-zàáâãäåèéêëìíîïòóôõöùúûüýÿ]/gi, "").toLowerCase();
  if (word.length === 0) return 0;
  if (word.length <= 2) return 1;

  let count = 0;
  let prevVowel = false;
  for (const ch of word) {
    const isVowel = VOWELS.includes(ch);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  return Math.max(1, count);
}

export function countSyllables(line: string): number {
  const words = line.trim().split(/\s+/);
  let total = 0;
  for (const w of words) total += countWordSyllables(w);
  return Math.max(1, total);
}

function getLineEnding(line: string): string {
  const words = line.trim().split(/\s+/);
  const last = (words[words.length - 1] ?? "").toLowerCase().replace(/[^a-z]/g, "");
  return last.slice(-3);
}

export function detectRhymeScheme(lines: string[]): string {
  const endings = lines.map(getLineEnding);
  const scheme: string[] = [];
  const assigned = new Map<string, string>();
  let next = 0;
  for (const e of endings) {
    if (!assigned.has(e)) {
      assigned.set(e, String.fromCharCode(65 + next));
      next++;
    }
    scheme.push(assigned.get(e)!);
  }
  return scheme.join("");
}

export interface AnalysisResult {
  lineCount: number;
  syllableCounts: number[];
  rhymeScheme: string;
  avgSyllables: number;
  suggestions: string[];
}

export function analyzeText(text: string): AnalysisResult {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return {
      lineCount: 0,
      syllableCounts: [],
      rhymeScheme: "",
      avgSyllables: 0,
      suggestions: ["No text to analyze — try pasting a poem or verse."],
    };
  }

  const syllableCounts = lines.map(countSyllables);
  const rhymeScheme = detectRhymeScheme(lines);
  const avgSyllables =
    Math.round((syllableCounts.reduce((a, b) => a + b, 0) / syllableCounts.length) * 10) / 10;
  const suggestions = generateSuggestions(syllableCounts, rhymeScheme, avgSyllables);

  return { lineCount: lines.length, syllableCounts, rhymeScheme, avgSyllables, suggestions };
}

function generateSuggestions(
  syllableCounts: number[],
  rhymeScheme: string,
  avgSyllables: number,
): string[] {
  const suggestions: string[] = [];
  const max = Math.max(...syllableCounts);
  const min = Math.min(...syllableCounts);

  if (max - min > 4) {
    suggestions.push(
      "Your lines vary a lot in length — try keeping syllable counts closer for a smoother rhythm.",
    );
  }

  const unique = new Set(rhymeScheme.split(""));
  if (unique.size === rhymeScheme.length && rhymeScheme.length > 2) {
    suggestions.push(
      "No clear rhyme pattern detected — consider adding end rhymes for structure.",
    );
  } else if (unique.size <= 2 && rhymeScheme.length > 4) {
    suggestions.push("Strong rhyme pattern! Consider varying it to keep things fresh.");
  }

  if (avgSyllables > 12) {
    suggestions.push("Lines are quite long — shorter lines often pack more punch.");
  } else if (avgSyllables < 4) {
    suggestions.push("Very concise lines — consider expanding slightly for richer imagery.");
  }

  if (syllableCounts.length < 4) {
    suggestions.push("A few more lines could help develop your idea further.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Nice rhythm! Your piece flows well. Try experimenting with enjambment for variety.");
  }

  return suggestions;
}

export interface RhymeSuggestion {
  original: string;
  suggestion: string;
  explanation: string;
}

const RHYME_MAP: Record<string, string[]> = {
  at: ["cat", "hat", "bat", "flat", "splat"],
  ight: ["light", "sight", "might", "night", "bright"],
  ay: ["day", "way", "say", "play", "stay"],
  ove: ["love", "dove", "above"],
  ain: ["rain", "pain", "gain", "chain", "train"],
  ore: ["more", "shore", "door", "floor", "core"],
  ue: ["true", "blue", "new", "view", "few"],
  ine: ["line", "mine", "fine", "shine", "wine"],
  ound: ["sound", "ground", "found", "round", "bound"],
  ake: ["make", "take", "shake", "wake", "break"],
  eart: ["heart", "start", "part", "art"],
  een: ["green", "seen", "been", "mean", "clean"],
  air: ["air", "fair", "care", "share", "dare"],
  old: ["gold", "cold", "bold", "told", "hold"],
};

function findRhyme(word: string): string {
  const lower = word.toLowerCase();
  const ending = lower.match(/[aeiouy]+.*$/)?.[0] ?? lower.slice(-3);
  for (const [pattern, rhymes] of Object.entries(RHYME_MAP)) {
    if (ending.includes(pattern)) {
      const filtered = rhymes.filter((r) => r !== lower);
      if (filtered.length > 0) return filtered[0];
    }
  }
  return "[rhyming word]";
}

export function suggestRhymeImprovements(text: string): RhymeSuggestion[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const endings = lines.map(getLineEnding);
  const groups = new Map<string, number[]>();
  endings.forEach((e, i) => {
    if (!groups.has(e)) groups.set(e, []);
    groups.get(e)!.push(i);
  });

  const results: RhymeSuggestion[] = [];
  for (const [, indices] of groups) {
    if (indices.length === 1) {
      const line = lines[indices[0]];
      const lastWord = line.trim().split(/\s+/).pop() ?? "";
      results.push({
        original: lastWord,
        suggestion: findRhyme(lastWord),
        explanation: `This line doesn't rhyme with any other — try replacing "${lastWord}" with a rhyming word.`,
      });
    }
  }
  return results.slice(0, 3);
}

export function suggestMeterImprovements(text: string): RhymeSuggestion[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const counts = lines.map(countSyllables);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const results: RhymeSuggestion[] = [];
  counts.forEach((c, i) => {
    if (Math.abs(c - avg) > 3) {
      results.push({
        original: lines[i].trim(),
        suggestion: `Aim for ~${Math.round(avg)} syllables (currently ${c})`,
        explanation: `This line is significantly different from the average (${Math.round(avg)} syllables) and may disrupt the meter.`,
      });
    }
  });
  return results.slice(0, 3);
}

const VAGUE_WORDS = new Set([
  "good",
  "bad",
  "nice",
  "beautiful",
  "ugly",
  "happy",
  "sad",
  "big",
  "small",
  "thing",
  "stuff",
  "great",
  "fine",
  "okay",
  "pretty",
]);

export function suggestImageryImprovements(text: string): RhymeSuggestion[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const results: RhymeSuggestion[] = [];
  lines.forEach((line, i) => {
    for (const word of line.split(/\s+/)) {
      const clean = word.toLowerCase().replace(/[^a-z]/g, "");
      if (VAGUE_WORDS.has(clean)) {
        results.push({
          original: clean,
          suggestion: "Try a more specific, vivid word",
          explanation: `"${clean}" in line ${i + 1} is vague — can you paint a more specific picture?`,
        });
      }
    }
  });
  return results.slice(0, 3);
}
