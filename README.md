# clip-tokenizer-rs

Fast CLIP text tokenizer for Node.js/Bun, powered by Rust and napi-rs.

## Features

- Fast: Native Rust implementation via napi-rs
- Zero runtime deps: No Python required
- Accurate: Official CLIP BPE vocabulary (49408 tokens)
- Cross-platform: macOS and Linux (x64, arm64)

## Installation

```bash
bun add clip-tokenizer-rs
# or
npm install clip-tokenizer-rs
```

Requires Node.js 10+ or Bun 1.0+ (NAPI v4).

## Usage

```ts
import { encode, count } from "clip-tokenizer-rs";

// Tokenize text
const tokens = encode("a photo of a cat");
// => [320, 1125, 539, 320, 2368]

// Count tokens without returning array
const tokenCount = count("a photo of a cat");
// => 5
```

## API

### `encode(text: string): number[]`
Tokenizes text and returns an array of token IDs.

### `count(text: string): number`
Returns the number of tokens.

## Limitations

- Returns raw tokens; does not truncate/pad to 77 tokens
- Apply truncation at model inference if needed for CLIP
- Windows not currently supported

## Platform Support

| Platform | Architecture |
|----------|-------------|
| macOS | x64, arm64 |
| Linux | x64, arm64 |

## Development

```bash
# Build native module
cargo build --release

# Run tests
bun test
```

## License

MIT
