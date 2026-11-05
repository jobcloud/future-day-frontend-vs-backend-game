#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

rm -f game.zip

files=(index.html gameplay.js)
for name in player1 player2 hintergrund; do
  for extension in png jpeg jpg webp gif; do
    file="${name}.${extension}"
    if [[ -f "$file" ]]; then
      files+=("$file")
    fi
  done
done
files+=(src)

zip -r game.zip "${files[@]}"
