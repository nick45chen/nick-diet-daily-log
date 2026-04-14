#!/bin/bash
set -e

PORT=8000
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting local server at http://localhost:$PORT"
open "http://localhost:$PORT"
python3 -m http.server "$PORT" --directory "$ROOT"
