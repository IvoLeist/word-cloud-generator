# .codex/setup.sh — runs once per worktree creation
#!/bin/bash
set -e
cd "$CODEX_WORKTREE_PATH"

# Install deps (offline cache makes this fast after first run)
if [ -f "package.json" ]; then
  npm ci --prefer-offline
fi

# Copy env file from main worktree
if [ -f "../.env" ]; then
  cp "../.env" ".env"
fi

echo "✅ Worktree ready: $CODEX_WORKTREE_PATH"