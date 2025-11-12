#!/bin/bash

echo "installing nginx dep"
apk --no-cache add php84 \
    php84-opcache php84-zip php84-intl \
    php84-bcmath php84-mbstring php84-simplexml php84-dom \
    php84-pdo php84-mysqlnd php84-pdo_mysql \
    php84-curl php84-ctype php84-pecl-redis

# php84-json already pre installed
apk --no-cache add zlib gzip curl
# cron
apk --no-cache add cronie

[[ -f /usr/bin/php ]] || ln -s /usr/bin/php84 /usr/bin/php

echo "finished"
# increase memory size
sed -i -E "s/memory_limit\\s*=\\s*[0-9]+.*$/memory_limit=1024M/g" "/etc/php84/php.ini"
