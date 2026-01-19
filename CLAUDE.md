# clip-tokenizer-rs

A fast CLIP text tokenizer for Node.js/Bun, implemented in Rust with napi-rs bindings.

## Project Overview

This library provides native CLIP (Contrastive Language-Image Pre-training) tokenization using:
- **Rust core**: Uses `instant-clip-tokenizer` crate for BPE tokenization
- **napi-rs bindings**: Exposes `encode()` and `count()` functions to JavaScript/TypeScript
- **Embedded vocabulary**: The BPE vocabulary (49408 tokens) is gzip-compressed and embedded at compile time

## Project Structure

```
clip-tokenizer-rs/
├── src/lib.rs           # Rust implementation (encode, count functions)
├── build.rs             # napi-rs build setup
├── Cargo.toml           # Rust dependencies
├── vocab/               # Embedded vocabulary (gzipped)
├── index.js             # Generated JS bindings
├── index.d.ts           # TypeScript declarations
├── index.test.ts        # Unit tests
├── tests/
│   ├── conformance.test.ts    # E2E tests against HuggingFace
│   └── fixtures/              # Golden test fixtures
├── scripts/
│   └── generate-fixtures.ts   # Regenerates HuggingFace fixtures
└── .github/workflows/ci.yml   # CI/CD pipeline
```

## Development Commands

### Building

```bash
# Build release native module for current platform
bun run build

# Build debug version (faster, for development)
bun run build:debug

# Or directly with cargo (Rust only, no JS bindings)
cargo build --release
```

### Testing

```bash
# Run all tests (requires built .node binary)
bun test

# Run Rust lints
cargo clippy --all-targets --all-features -- -D warnings

# Check Rust formatting
cargo fmt --check
```

### Fixture Regeneration

Only regenerate fixtures when adding new test cases or upgrading @huggingface/transformers:

```bash
bun scripts/generate-fixtures.ts
```

**IMPORTANT**: Do NOT regenerate fixtures to make failing tests pass. Investigate the Rust implementation first.

## API

```typescript
import { encode, count } from "clip-tokenizer-rs";

// Tokenize text to token IDs
const tokens = encode("a photo of a cat");  // => [320, 1125, 539, 320, 2368]

// Count tokens without allocation
const n = count("a photo of a cat");  // => 5
```

## Key Implementation Details

### Rust Code (src/lib.rs)

- Uses `OnceLock` for lazy tokenizer initialization (singleton pattern)
- Vocabulary is decompressed from gzip on first use
- `TYPICAL_TOKEN_CAPACITY = 77` matches CLIP's max context length
- Returns raw tokens WITHOUT BOS/EOS special tokens

### napi-rs Integration

- Functions decorated with `#[napi]` are exported to JavaScript
- `Token::to_u16()` values are cast to `u32` for napi compatibility
- Panics in tokenizer initialization crash the Node.js process

## Code Style

### Rust

- 2-space indentation (see `rustfmt.toml`)
- `#![deny(clippy::all)]` enforced
- Run `cargo fmt` before committing (auto-runs via Claude hooks)

### TypeScript

- Use Bun for all JS/TS operations (not Node.js)
- Tests use `bun:test` framework
- 2-space indentation (see `.editorconfig`)

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint**: `cargo fmt --check`, `cargo clippy`, `bun install`
2. **Build**: Cross-compiles for 4 targets:
   - `x86_64-apple-darwin` (macOS Intel)
   - `aarch64-apple-darwin` (macOS ARM)
   - `x86_64-unknown-linux-gnu` (Linux x64)
   - `aarch64-unknown-linux-gnu` (Linux ARM, via cross)
3. **Test**: Runs `bun test` on native platforms
4. **Release**: Semantic release to npm (on main branch push)

## Testing Strategy

### Unit Tests (index.test.ts)

- Basic functionality (encode, count)
- Edge cases (empty strings, unicode, emoji, long strings)
- Determinism verification

### Conformance Tests (tests/conformance.test.ts)

- Validates against @huggingface/transformers golden fixtures
- Covers ~75 test cases across categories:
  - Basic text, Unicode/accents, Emoji
  - Whitespace, Special characters, Long text
  - Mixed scripts, Numbers/punctuation
  - BPE edge cases, Contractions

**If conformance tests fail**:
1. DO NOT regenerate fixtures immediately
2. Investigate whether Rust implementation has a bug
3. Fix Rust code if it's incorrect
4. Only regenerate fixtures if HuggingFace changed

## Issue Tracking

This project uses **bd** (beads) for issue tracking:

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Platform Support

| Platform | Architecture | Support |
|----------|-------------|---------|
| macOS    | x64, arm64  | Full    |
| Linux    | x64, arm64  | Full    |
| Windows  | -           | Not supported |

## Dependencies

### Rust (Cargo.toml)

- `napi` / `napi-derive`: Node.js native addon bindings
- `instant-clip-tokenizer`: CLIP BPE tokenizer implementation
- `flate2`: Gzip decompression for embedded vocabulary

### JavaScript (package.json)

- `@napi-rs/cli`: Build tooling for native modules
- `@huggingface/transformers`: Reference implementation (dev only)
- `semantic-release`: Automated releases

## Release Process

Releases are automated via semantic-release on push to `main`:

1. Conventional commits are analyzed
2. Version is bumped based on commit types
3. CHANGELOG.md is updated
4. Native binaries are published to npm with provenance
5. GitHub release is created

Commit prefixes:
- `feat:` - Minor version bump
- `fix:` - Patch version bump
- `BREAKING CHANGE:` - Major version bump
