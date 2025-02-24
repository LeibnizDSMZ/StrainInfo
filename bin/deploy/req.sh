#!/bin/bash

ROOT="$(dirname "$(realpath "$0")")/../.."
source "$ROOT/.env"

echo "update"
dnf -y update
echo "installing requirements"
dnf -y install zlib gzip vim git git-lfs make gcc-c++ findutils wget unzip
echo "requirements installed"
echo "install php"
dnf -y install dnf-utils https://mirror.dogado.de/remi/enterprise/remi-release-9.rpm && dnf -y update
dnf -y remove php
dnf -y remove php*
dnf -y module reset php
dnf -y module enable php:remi-8.2
dnf -y install php-cli
# extensions
dnf -y install php-opcache php-zip php-intl \
    php-bcmath php-json php-mbstring php-simplexml php-dom \
    php-pdo php-mysqlnd php-pdo_mysql php-curl
echo "php installed"
echo "installing nodejs"
dnf -y module enable nodejs:"$NODE_VER"
dnf -y install nodejs
# for bun
npm install -g node-gyp
echo "nodejs installed"
echo "installing python"
dnf -y install python3.9
echo "python installed"
# for woff2
mkdir /woff_parser && cd /woff_parser || exit
git clone --recursive https://github.com/google/woff2.git
cd woff2 || exit
make clean all
ln -s /woff_parser/woff2/woff2_compress /bin/woff2_compress
# increase memory size
sed -i -E "s/memory_limit\\s*=\\s*[0-9]+.*$/memory_limit=1024M/g" "/etc/php.ini"
