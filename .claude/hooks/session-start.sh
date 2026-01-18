#!/bin/bash
# .claude/hooks/session-start.sh
# Auto-installs bd (beads issue tracker) for Claude Code Web sessions

echo "Setting up bd (beads issue tracker)..."

# Try npm first, fall back to go install
if ! command -v bd &> /dev/null; then
    if npm install -g @beads/bd --quiet 2>/dev/null && command -v bd &> /dev/null; then
        echo "Installed via npm"
    elif command -v go &> /dev/null; then
        echo "npm install failed, trying go install..."
        go install github.com/steveyegge/beads/cmd/bd@latest
        export PATH="$PATH:$HOME/go/bin"
        echo "Installed via go install"
    else
        echo "Installation failed - neither npm nor go available"
        exit 1
    fi
fi

# Verify installation
bd version

# Initialize if needed
if [ ! -d .beads ]; then
    bd init --quiet
fi

echo "bd is ready! Use 'bd ready' to see available work."
