#!/bin/bash
ROOT="$(dirname "$(realpath "$0")")/../.."
source "$ROOT/.env"
UVE="$UV_INSTALL_DIR/uv"

echo "$UV_CACHE_DIR"
echo "$UV_INSTALL_DIR"
echo "$UV_PYTHON_INSTALL_DIR"
echo "$UV_PYTHON_BIN_DIR"
echo "$UV_TOOL_DIR"
echo "$UV_TOOL_BIN_DIR"
echo "$UV_NO_MODIFY_PATH"

[[ -d "$UV_INSTALL_DIR" ]] || (curl -LsSf https://astral.sh/uv/install.sh | bash)
"$UVE" python install "$PYV" --force
rm -rf .venv
"$UVE" venv --python="$PYV" --relocatable --link-mode=copy --seed
"$UVE" pip install --upgrade pip