#!/bin/bash

BIN_DIR="$(dirname "$(realpath "$0")")"
ROOT="$BIN_DIR/../.."
source "$ROOT/.env"
source "$ROOT/$STRINF_BACKEND_ENV"

echo "install project"
NONCE_L="$(mktemp -u XXXXXXXXXX)"

sed -i -E "s/(sub_filter)\\s+N0nce_W3B\\s+(.+;)/\\1 $NONCE_L \\2/g" "$ROOT/$CONFIG_WEB_FRONTEND"

echo "fix config $ROOT/$CONFIG_STRINF -> $FIX_CONFIG"

if [[ 'true' = "$FIX_CONFIG" && -f "$ROOT/$CONFIG_STRINF" ]]; then
    echo "running port fix for stage"
    python3 -c 'import json,sys;fr=open(sys.argv[1], "r");dat=json.load(fr);fr.close();fw=open(sys.argv[1], "w");json.dump(dat, fw);fw.close();' "$ROOT/$CONFIG_STRINF"

    sed -i -E "s/(\"frontend\"\\s*:\\s*\\{[^{]*\"web\"\\s*:\\s*\\{[^{]*\"port\"\\s*:)\\s*[0-9]+/\\1 9002/g" "$ROOT/$CONFIG_STRINF"
    sed -i -E "s/(\"backend\"\\s*:\\s*\\{[^{]*\"web\"\\s*:\\s*\\{[^{]*\"port\"\\s*:)\\s*[0-9]+/\\1 3030/g" "$ROOT/$CONFIG_STRINF"
fi

make uninstall
NONCE_WEB="$NONCE_L" PURGE_CSS="true" make runBuild

mkdir -p "/var/www/$APP_STRINF_ROOT"
rm -rf /etc/nginx/http.d/*

mkdir -p "$SERVER_WEB_CONFS_DIR"

cp -RT "$ROOT/$APP_STRINF" "/var/www/$APP_STRINF_ROOT"
BACKEND_STAGE_PORT="$BACKEND_STAGE_PORT"  envsubst '$BACKEND_STAGE_PORT' < "$ROOT/$CONFIG_WEB_BACKEND" > "$SERVER_WEB_CONFS_DIR"/default.conf
cp "$ROOT/$CONFIG_WEB_FRONTEND" "$SERVER_WEB_CONFS_DIR"/frontend.conf

echo "project installed"
cat "$SERVER_WEB_CONFS_DIR"/default.conf 