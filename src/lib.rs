#![deny(clippy::all)]

use flate2::read::GzDecoder;
use instant_clip_tokenizer::{Token, Tokenizer};
use napi_derive::napi;
use std::io::BufReader;
use std::sync::OnceLock;

const VOCAB_GZ: &[u8] = include_bytes!("../vocab/bpe_simple_vocab_16e6.txt.gz");

// CLIP's model uses max 77 tokens, but tokenizer can produce more.
// This is a reasonable pre-allocation size for typical inputs.
const TYPICAL_TOKEN_CAPACITY: usize = 77;

static TOKENIZER: OnceLock<Tokenizer> = OnceLock::new();

fn get_tokenizer() -> &'static Tokenizer {
  TOKENIZER.get_or_init(|| {
    let decoder = GzDecoder::new(VOCAB_GZ);
    let reader = BufReader::new(decoder);
    // SAFETY: Vocabulary is embedded at compile time and guaranteed valid.
    // Note: Panics here crash the Node.js process (NAPI behavior).
    Tokenizer::with_vocabulary(reader, 49408).expect("Failed to load embedded vocabulary")
  })
}

#[napi]
pub fn encode(text: String) -> Vec<u32> {
  let tokenizer = get_tokenizer();
  let mut tokens: Vec<Token> = Vec::with_capacity(TYPICAL_TOKEN_CAPACITY);
  tokenizer.encode(&text, &mut tokens);
  tokens.into_iter().map(|t| t.to_u16() as u32).collect()
}

#[napi]
pub fn count(text: String) -> u32 {
  let tokenizer = get_tokenizer();
  // Must allocate Vec as tokenizer.encode() requires mutable buffer
  let mut tokens: Vec<Token> = Vec::with_capacity(TYPICAL_TOKEN_CAPACITY);
  tokenizer.encode(&text, &mut tokens);
  tokens.len() as u32
}
