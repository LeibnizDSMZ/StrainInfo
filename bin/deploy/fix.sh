#!/bin/bash

ROOT="$(dirname "$(realpath "$0")")/../.."
source "$ROOT/.env"

echo "prepare for packaging"

mkdir -p "$(dirname "$ROOT/$CONFIG_STRINF")"
mkdir -p "$(dirname "$ROOT/$CONFIG_DEPLOY")"

echo "create empty config"
if [ ! -f "$ROOT/$CONFIG_STRINF" ]; then
    cat "$ROOT/$TEMPL_CONFIG_STRINF" >"$ROOT/$CONFIG_STRINF"
fi

echo "create empty deploy config"
if [ ! -f "$ROOT/$CONFIG_DEPLOY" ]; then
    cat "$ROOT/$TEMPL_CONFIG_DEPLOY" >"$ROOT/$CONFIG_DEPLOY"
fi

IN_STYLE=$(sed -nr 's/\s*-?\s*style\s*:\s*["'\''](.+)["'\'']/\1/p' "$ROOT/$CONFIG_DEPLOY")
IN_ASSETS=$(sed -nr 's/\s*-?\s*assets\s*:\s*["'\''](.+)["'\'']/\1/p' "$ROOT/$CONFIG_DEPLOY")

echo "$IN_STYLE"
echo "$IN_ASSETS"

echo "fetching custom style - currently digidive"
mkdir -p "$ROOT/$EXTRA_STYLE"
if [ ! "$(ls -A "$ROOT/$EXTRA_STYLE")" ] &&
    wget -q -O /tmp/style_container "$IN_STYLE" >/dev/null &&
    [[ "$IN_STYLE" == *"$VERSION_EX_STYLE"* ]]; then
    unzip /tmp/style_container -d /tmp/style
    echo "$ROOT/$EXTRA_STYLE"
    mv "/tmp/style/dist/"* "$ROOT/$EXTRA_STYLE/"
    sed -i -E 's/fill:%23006eb7/fill:%23ECAF00/g' "$ROOT/$EXTRA_STYLE/css/digidive.css"
    sed -i -E "s/(font-family\\s*:\\s*['\"].*['\"]\\s*;)/\\1\\n\\tfont-display: swap;/g" "$ROOT/$EXTRA_STYLE/css/digidive.css"
    sed -i -E 's/max-width:\s*var\(150rem\);//g' "$ROOT/$EXTRA_STYLE/css/digidive.css"
    sed -i -E 's/format\("truetype"\)/format\("woff2"\)/g' "$ROOT/$EXTRA_STYLE/css/digidive.css"
    sed -i -E 's/\.otf/\.woff2/g' "$ROOT/$EXTRA_STYLE/css/digidive.css"
    sed -i -E 's/\.ttf/\.woff2/g' "$ROOT/$EXTRA_STYLE/css/digidive.css"
    echo "window.style = digidive;" >>"$ROOT/$EXTRA_STYLE/js/digidive.js"
    find "$ROOT/$EXTRA_STYLE/css/" -name "*.ttf" -exec woff2_compress {} \;
    find "$ROOT/$EXTRA_STYLE/css/" -name "*.otf" -exec woff2_compress {} \;
fi
echo "{\"name\": \"digidive\",\"private\": true,\"author\": \"Julia Koblitz\",\"license\": \"MIT\",\"version\": \"$VERSION_EX_STYLE\",\"main\": \"js/digidive.js\"}" >"$ROOT/$EXTRA_STYLE/package.json"
mkdir -p "$ROOT/$EXTRA_STYLE/js"
cp "$ROOT/assets/patch/style.d.ts" "$ROOT/$EXTRA_STYLE/js/digidive.d.ts"

echo "fetching logos"
mkdir -p "$ROOT/$EXTRA_ASSETS"
if [ ! "$(ls -A "$ROOT/$EXTRA_ASSETS")" ] &&
    wget -q -O "$ROOT/$EXTRA_ASSETS/out.tar.gz" "$IN_ASSETS" >/dev/null; then
    tar -xvzf "$ROOT/$EXTRA_ASSETS/out.tar.gz" --directory "$ROOT/$EXTRA_ASSETS/"
    mv "$ROOT/$EXTRA_ASSETS/strinfassets-main/straininfo/"* "$ROOT/$EXTRA_ASSETS/"
    rm -rf "${ROOT:?}/$EXTRA_ASSETS/strinfassets-main"
    rm -f "${ROOT:?}/$EXTRA_ASSETS/out.tar.gz"
fi
echo "{\"name\": \"@extra/straininfo\",\"private\": true,\"author\": \"Artur Lissin\",\"version\": \"0.0.0\"}" >"$ROOT/$EXTRA_ASSETS/package.json"

echo "preparation finished"
