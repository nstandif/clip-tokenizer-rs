#!/usr/bin/env bun
/**
 * Generate golden fixtures from @huggingface/transformers CLIPTokenizer.
 *
 * Run: bun scripts/generate-fixtures.ts
 *
 * IMPORTANT: This script should only be run manually when:
 * - Adding new test cases
 * - Upgrading @huggingface/transformers version
 * - Investigating tokenization discrepancies
 *
 * The generated fixtures are the source of truth for conformance testing.
 */

import { CLIPTokenizer } from "@huggingface/transformers";
import { version } from "@huggingface/transformers/package.json";

const MODEL = "openai/clip-vit-base-patch32";

// Test cases organized by category (~75 total)
const TEST_CASES: Record<string, string[]> = {
  // Basic text (5 cases)
  basic: [
    "hello",
    "a photo of a cat",
    "a photo of a dog",
    "hello world",
    "The quick brown fox jumps over the lazy dog",
  ],

  // Unicode/Accents (10 cases)
  unicode_accents: [
    "café",
    "naïve",
    "résumé",
    "北京",
    "東京",
    "Привет",
    "مرحبا",
    "שלום",
    "สวัสดี",
    "Ελληνικά",
  ],

  // Emoji (8 cases)
  emoji: [
    "🌍",
    "👋🏽",
    "🎉✨🚀",
    "Hello 🌍",
    "🐱🐶",
    "😀😃😄😁",
    "🇺🇸",
    "👨‍👩‍👧‍👦",
  ],

  // Whitespace (5 cases)
  whitespace: [
    "",
    "   ",
    "hello  world",
    "tabs\there",
    "  leading and trailing  ",
  ],

  // Special characters (8 cases)
  special_chars: [
    "!@#$%",
    "hello\nworld",
    "line1\r\nline2",
    "<html>",
    "&amp;",
    "path/to/file.txt",
    "user@example.com",
    "https://example.com/path?query=value",
  ],

  // Long text (5 cases)
  long_text: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "CLIP (Contrastive Language-Image Pre-training) is a neural network trained on a variety of (image, text) pairs. It can be instructed in natural language to predict the most relevant text snippet given an image.",
    "The model was trained on images from the internet paired with their corresponding alt-text descriptions, learning to associate visual concepts with natural language.",
    "Artificial intelligence and machine learning have revolutionized how we process and understand both text and images in modern computing systems.",
    "This is a very long sentence that should produce more than seventy seven tokens when tokenized by the CLIP tokenizer to test handling of longer sequences properly.",
  ],

  // Mixed scripts (8 cases)
  mixed_scripts: [
    "Hello 世界 🌍",
    "Привет мир",
    "こんにちは World",
    "Bonjour 世界",
    "Mixed: ABC 中文 123",
    "日本語 and English",
    "Français et 日本語",
    "한국어 Korean 한글",
  ],

  // Numbers/Punctuation (8 cases)
  numbers_punctuation: [
    "123.456",
    "$100.00",
    "Dr. Smith's",
    "50% off!",
    "3.14159265359",
    "2024-01-19",
    "12:30:45",
    "(555) 123-4567",
  ],

  // BPE edge cases (10 cases)
  bpe_edge_cases: [
    "hello...world",
    "iPhone",
    "don't",
    "aaaaaa",
    "UPPERCASE",
    "camelCase",
    "snake_case",
    "kebab-case",
    "MixedCASE",
    "word1word2word3",
  ],

  // Contractions (8 cases)
  contractions: [
    "can't",
    "won't",
    "it's",
    "I'm",
    "they're",
    "we've",
    "shouldn't",
    "could've",
  ],
};

async function main() {
  console.log("Loading HuggingFace CLIP tokenizer...");
  const tokenizer = await CLIPTokenizer.from_pretrained(MODEL);

  console.log(`Generating fixtures using @huggingface/transformers v${version}`);
  console.log(`Model: ${MODEL}\n`);

  const fixtures: Record<string, number[]> = {};
  let totalCases = 0;

  for (const [category, cases] of Object.entries(TEST_CASES)) {
    console.log(`Processing ${category} (${cases.length} cases)...`);

    for (const text of cases) {
      // CRITICAL: Use add_special_tokens: false to match Rust implementation
      const encoded = tokenizer.encode(text, { add_special_tokens: false });
      fixtures[text] = Array.from(encoded);
      totalCases++;
    }
  }

  const output = {
    _metadata: {
      generator: "@huggingface/transformers",
      version,
      model: MODEL,
      generated_at: new Date().toISOString(),
      total_fixtures: totalCases,
      note: "Regenerate only when HuggingFace behavior changes. Use: bun scripts/generate-fixtures.ts",
    },
    fixtures,
  };

  const outputPath = new URL("../tests/fixtures/clip-tokens.json", import.meta.url);

  // Ensure directory exists
  const dir = new URL("../tests/fixtures/", import.meta.url);
  await Bun.write(dir.pathname + ".gitkeep", "");

  await Bun.write(outputPath, JSON.stringify(output, null, 2) + "\n");

  console.log(`\nGenerated ${totalCases} fixtures`);
  console.log(`Written to: tests/fixtures/clip-tokens.json`);
}

main().catch(console.error);
