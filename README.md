# StrainInfo

[![release: 2025.10.5](https://img.shields.io/badge/rel-2025.10.5-blue.svg?style=flat-square)](https://github.com/LeibnizDSMZ/StrainInfo)
[![MIT LICENSE](https://img.shields.io/badge/License-MIT-brightgreen.svg?style=flat-square)](https://choosealicense.com/licenses/mit/)
[![Husky](https://img.shields.io/badge/Husky-enabled-brightgreen?style=flat-square)](https://github.com/typicode/husky)
[![PHPStan Enabled](https://img.shields.io/badge/PHPStan-enabled-brightgreen.svg?style=flat-square)](https://github.com/phpstan/phpstan)
[![ESLint Enabled](https://img.shields.io/badge/ESLint-enabled-brightgreen.svg?style=flat-square)](https://github.com/eslint/eslint)
[![Prettier Enabled](https://img.shields.io/badge/Prettier-enabled-brightgreen.svg?style=flat-square)](https://github.com/prettier/prettier)

[![DOI](https://zenodo.org/badge/932778634.svg)](https://doi.org/10.5281/zenodo.14872436)

---

## Description

In microbiology, the communication and comparison of research findings and data
is often complicated by the existence of a number of different designations and
identifiers for the same strain. StrainInfo is a service developed to provide a
resolution of microbial strain identifiers by storing culture collection numbers,
their relations, and deposition data.

---

## Requirements

### Default

- GNU/Linux
- PHP: ~8.4
- TS: ~5.8
- NODEJS: ~22

### Dev Container

- Docker
- Docker - Compose

### Web server

If you are using **Alpine Linux** as distribution, you can run the **bin/deploy/req.nginx.sh** script
as root to install all web server dependencies (web-server: nginx).

### Configuration

Create configuration files for the fullstack inside **configs/** and **strinf/backend/src/configs/** use **assets/templates** as an example.

- configs/deploy.local.yaml
- strinf/backend/src/configs/config.local.json

### Assets

To download all assets and external styles use **bin/deploy/fix.sh\*** (DSMZ only).

---

## Installation

To install StrainInfo run the following command:

```shell
PURGE_CSS="true" make runBuild
```

For development run the following commands:

```shell
make runDev
```

This will package the project into the **public/straininfo** folder, which can be used by your web server.

---

## Acknowledgements

- Adam Podstawka
- Joaquim Sardà Carbasse
- Lorenz C. Reimer
- Julia Koblitz
- Julius Witte
- Isabel Schober

---

## Info:

Don't use StrainInfo docker implementation in production. All Dockerfiles should only be used in local environments, e.g. your computer or inside local intranet, for development or staging only.
