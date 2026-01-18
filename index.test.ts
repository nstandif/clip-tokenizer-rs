import { test, expect } from "bun:test";
import { encode, count } from "./index";

test("encode returns token array", () => {
  const tokens = encode("a photo of a cat");
  expect(Array.isArray(tokens)).toBe(true);
  expect(tokens.length).toBeGreaterThan(0);
});

test("count returns token count", () => {
  const tokenCount = count("a photo of a cat");
  expect(typeof tokenCount).toBe("number");
  expect(tokenCount).toBeGreaterThan(0);
});

test("encode and count match", () => {
  const text = "a photo of a cat";
  const tokens = encode(text);
  const tokenCount = count(text);
  expect(tokens.length).toBe(tokenCount);
});

test("handles empty string", () => {
  const tokens = encode("");
  const tokenCount = count("");
  expect(tokens).toEqual([]);
  expect(tokenCount).toBe(0);
});

test("handles unicode", () => {
  const tokens = encode("café naïve résumé");
  expect(tokens.length).toBeGreaterThan(0);
});

test("known token values for 'a photo of a cat'", () => {
  const tokens = encode("a photo of a cat");
  expect(tokens).toEqual([320, 1125, 539, 320, 2368]);
});

// Edge case tests

test("handles long strings", () => {
  const longText = "hello world ".repeat(1000);
  const tokens = encode(longText);
  expect(tokens.length).toBeGreaterThan(1000);
  expect(count(longText)).toBe(tokens.length);
}, 10000);

test("handles control characters", () => {
  const tokens = encode("hello\x00world\ttab\nnewline");
  expect(tokens.length).toBeGreaterThan(0);
  expect(count("hello\x00world\ttab\nnewline")).toBe(tokens.length);
});

test("handles special characters", () => {
  const tokens = encode("!@#$%^&*()[]{}|;':\",./<>?");
  expect(tokens.length).toBeGreaterThan(0);
  expect(tokens.length).toBeLessThan(100);
  expect(count("!@#$%^&*()[]{}|;':\",./<>?")).toBe(tokens.length);
});

test("handles emoji", () => {
  const tokens = encode("Hello 🌍 World 🎉");
  expect(tokens.length).toBeGreaterThan(0);
  expect(count("Hello 🌍 World 🎉")).toBe(tokens.length);
});

test("handles whitespace variations", () => {
  // CLIP normalizes whitespace-only strings to empty
  const spaces = encode("   ");
  expect(spaces.length).toBe(0);
  expect(count("   ")).toBe(spaces.length);

  const mixed = encode("\t\n\r");
  expect(count("\t\n\r")).toBe(mixed.length);
});

test("handles mixed scripts", () => {
  const tokens = encode("Hello 你好 مرحبا Привет");
  expect(tokens.length).toBeGreaterThan(0);
  expect(count("Hello 你好 مرحبا Привет")).toBe(tokens.length);
});

test("deterministic encoding", () => {
  const text = "the quick brown fox";
  expect(encode(text)).toEqual(encode(text));
});

test("single character", () => {
  const tokens = encode("a");
  expect(tokens.length).toBe(1);
});
