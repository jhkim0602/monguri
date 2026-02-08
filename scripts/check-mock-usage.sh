#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PATTERN="MOCK_[A-Z0-9_]+|STUDENTS_MOCK|mock-rec|mock implementation|from\\s+[\\\"']@/.*/mock[\\\"']"

if rg -n --hidden -S "$PATTERN" src \
  --glob '!src/components/ui/exam-badge.tsx'; then
  echo
  echo "Mock references found. Please migrate or remove these usages."
  exit 1
fi

echo "No disallowed mock references found."
