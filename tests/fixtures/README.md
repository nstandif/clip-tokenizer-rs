# CLIP Tokenizer Fixtures

This directory contains golden fixtures for conformance testing the Rust CLIP tokenizer against `@huggingface/transformers`.

## Files

- `clip-tokens.json` - Golden fixtures with expected tokenization output

## When to Regenerate Fixtures

**Never regenerate fixtures automatically.** These fixtures are the source of truth.

Only regenerate when:

1. **Adding new test cases** - Update `scripts/generate-fixtures.ts` first
2. **Upgrading @huggingface/transformers** - After careful review of changes
3. **Investigating discrepancies** - When debugging tokenization issues

## How to Regenerate

```bash
bun scripts/generate-fixtures.ts
```

## Handling Test Failures

If conformance tests fail:

1. **DO NOT immediately regenerate fixtures**
2. Investigate whether the Rust implementation has a bug
3. Compare with HuggingFace's behavior using `scripts/manual_test.ts`
4. If Rust is wrong, fix the Rust implementation
5. If HuggingFace changed, regenerate after careful review

## Fixture Format

```json
{
  "_metadata": {
    "generator": "@huggingface/transformers",
    "version": "3.8.1",
    "model": "openai/clip-vit-base-patch32",
    "generated_at": "2026-01-19T...",
    "total_fixtures": 75,
    "note": "Regenerate only when HuggingFace behavior changes"
  },
  "fixtures": {
    "a photo of a cat": [320, 1125, 539, 320, 2368],
    ...
  }
}
```

## Important Notes

- Fixtures use `add_special_tokens: false` to match Rust's `encode()` behavior
- The Rust implementation returns raw tokens WITHOUT BOS/EOS tokens
- Token IDs are from the `openai/clip-vit-base-patch32` vocabulary
