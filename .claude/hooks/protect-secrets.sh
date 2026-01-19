#!/bin/bash
# .claude/hooks/protect-secrets.sh
# PreToolUse hook to block edits to sensitive files

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path // empty')

[ -z "$file_path" ] && exit 0

# Block .env files
if [[ "$file_path" =~ \.env($|\.) ]]; then
    echo '{"continue": false, "stopReason": "Blocked: Cannot edit .env files"}'
    exit 0
fi

# Check for secrets in existing files
if [ -f "$file_path" ]; then
    if grep -qE '(API_KEY|SECRET|PASSWORD|PRIVATE_KEY|TOKEN)=' "$file_path"; then
        echo '{"continue": false, "stopReason": "Blocked: File contains sensitive data"}'
        exit 0
    fi
fi

exit 0
