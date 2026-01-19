#!/bin/bash
# .claude/hooks/post-edit.sh
# PostToolUse hook to run cargo fmt + clippy after Rust file edits

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path // empty')

# Only for Rust files
[[ "$file_path" != *.rs ]] && exit 0

# Format
cargo fmt --quiet 2>/dev/null

# Clippy feedback (non-blocking)
clippy_output=$(cargo clippy --message-format=short 2>&1 | head -20)
if [ -n "$clippy_output" ]; then
    echo "Clippy warnings:"
    echo "$clippy_output"
fi

exit 0
