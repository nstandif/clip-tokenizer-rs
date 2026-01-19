/**
 * E2E Conformance tests validating Rust CLIP tokenizer against HuggingFace fixtures.
 *
 * These tests use pre-generated golden fixtures from @huggingface/transformers.
 * No HuggingFace dependency is required at test time.
 *
 * If tests fail:
 * 1. DO NOT immediately regenerate fixtures
 * 2. Investigate whether the Rust implementation has a bug
 * 3. See tests/fixtures/README.md for guidance
 */

import { test, expect, describe } from "bun:test";
import { encode } from "../index";
import fixtures from "./fixtures/clip-tokens.json";

// Type for the fixture file structure
interface FixtureFile {
  _metadata: {
    generator: string;
    version: string;
    model: string;
    generated_at: string;
    total_fixtures: number;
    note: string;
  };
  fixtures: Record<string, number[]>;
}

const { _metadata, fixtures: testCases } = fixtures as FixtureFile;

describe("CLIP Tokenizer Conformance", () => {
  test("fixture metadata is valid", () => {
    expect(_metadata.generator).toBe("@huggingface/transformers");
    expect(_metadata.model).toBe("openai/clip-vit-base-patch32");
    expect(_metadata.total_fixtures).toBeGreaterThan(0);
  });

  describe("Basic text", () => {
    const basicCases = [
      "hello",
      "a photo of a cat",
      "a photo of a dog",
      "hello world",
      "The quick brown fox jumps over the lazy dog",
    ];

    for (const text of basicCases) {
      if (text in testCases) {
        test(`"${text}"`, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  describe("Unicode/Accents", () => {
    const unicodeCases = [
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
    ];

    for (const text of unicodeCases) {
      if (text in testCases) {
        test(`"${text}"`, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  describe("Emoji", () => {
    const emojiCases = [
      "🌍",
      "👋🏽",
      "🎉✨🚀",
      "Hello 🌍",
      "🐱🐶",
      "😀😃😄😁",
      "🇺🇸",
      "👨‍👩‍👧‍👦",
    ];

    for (const text of emojiCases) {
      if (text in testCases) {
        test(`"${text}"`, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  describe("Whitespace", () => {
    const whitespaceCases = ["", "   ", "hello  world", "tabs\there", "  leading and trailing  "];

    for (const text of whitespaceCases) {
      if (text in testCases) {
        const label = text === "" ? "(empty string)" : `"${text.replace(/\t/g, "\\t")}"`;
        test(label, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  describe("Special characters", () => {
    const specialCases = [
      "!@#$%",
      "hello\nworld",
      "line1\r\nline2",
      "<html>",
      "&amp;",
      "path/to/file.txt",
      "user@example.com",
      "https://example.com/path?query=value",
    ];

    for (const text of specialCases) {
      if (text in testCases) {
        const label = text.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        test(`"${label}"`, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  describe("Long text", () => {
    // Test all long text cases from fixtures
    const longTextCases = Object.keys(testCases).filter((k) => k.length > 80);

    for (const text of longTextCases) {
      const label = text.substring(0, 50) + "...";
      test(`"${label}"`, () => {
        expect(encode(text)).toEqual(testCases[text]);
      });
    }
  });

  describe("Mixed scripts", () => {
    const mixedCases = [
      "Hello 世界 🌍",
      "Привет мир",
      "こんにちは World",
      "Bonjour 世界",
      "Mixed: ABC 中文 123",
      "日本語 and English",
      "Français et 日本語",
      "한국어 Korean 한글",
    ];

    for (const text of mixedCases) {
      if (text in testCases) {
        test(`"${text}"`, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  describe("Numbers/Punctuation", () => {
    const numberCases = [
      "123.456",
      "$100.00",
      "Dr. Smith's",
      "50% off!",
      "3.14159265359",
      "2024-01-19",
      "12:30:45",
      "(555) 123-4567",
    ];

    for (const text of numberCases) {
      if (text in testCases) {
        test(`"${text}"`, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  describe("BPE edge cases", () => {
    const bpeCases = [
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
    ];

    for (const text of bpeCases) {
      if (text in testCases) {
        test(`"${text}"`, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  describe("Contractions", () => {
    const contractionCases = [
      "can't",
      "won't",
      "it's",
      "I'm",
      "they're",
      "we've",
      "shouldn't",
      "could've",
    ];

    for (const text of contractionCases) {
      if (text in testCases) {
        test(`"${text}"`, () => {
          expect(encode(text)).toEqual(testCases[text]);
        });
      }
    }
  });

  // Catch-all test to ensure all fixtures pass
  describe("All fixtures", () => {
    test(`total of ${Object.keys(testCases).length} fixtures pass`, () => {
      const failures: string[] = [];

      for (const [text, expected] of Object.entries(testCases)) {
        const actual = encode(text);
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          failures.push(`"${text}": expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
      }

      if (failures.length > 0) {
        throw new Error(`${failures.length} fixtures failed:\n${failures.join("\n")}`);
      }
    });
  });
});
