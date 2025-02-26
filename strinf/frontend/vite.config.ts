import { defineConfig, loadEnv } from 'vite';
import type { PreviewOptions, ServerOptions, UserConfig } from 'vite';
import preact from '@preact/preset-vite';
import mdx from '@mdx-js/rollup';
import Path from 'path';
import RemGfm from 'remark-gfm';
import RemImg from 'remark-images';
import RehHig from 'rehype-highlight';
import rollupPluginLicense from 'rollup-plugin-license';
import fs from 'node:fs';
import { visualizer } from 'rollup-plugin-visualizer';
import type { OutgoingHttpHeaders } from 'node:http';
import { PurgeCSS } from 'purgecss';
import { UIApiCon } from './src/ts/constants/api/ui_api';
import { RESOURCES_PATH } from './src/ts/constants/resources';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const ROOT = Path.resolve(__dirname, '../../');
const LOCAL_DIR = Path.resolve(__dirname);
const TIME_STAMP = Math.floor(Date.now() / 1000).toString(36);

function getNonceSub(): string {
    return process.env['NONCE_WEB'] ?? 'N0nce_W3B';
}

function getEnv(): string {
    return process.env['NODE_ENV'] ?? 'development';
}

function isStage(): boolean {
    if (!('STAGE' in process.env)) {
        return false;
    }
    return process.env['STAGE'] === 'true';
}

function getBench(): string {
    return process.env['BENCHMARK'] ?? 'false';
}

function getPurgeCss(): string {
    return process.env['PURGE_CSS'] ?? 'false';
}

function getPreviewPort(): number {
    return Number(process.env['FRONTEND_STAGE_PORT'] ?? '9000');
}

function getDevPort(): number {
    return Number(process.env['FRONTEND_DEV_PORT'] ?? '9000');
}

const ENV = loadEnv(getEnv(), LOCAL_DIR, '') as {
    [key: string]: string;
    APP_FRONTEND: string;
    CACHE_FE_VITE: string;
    STRINF_FRONTEND_SRC: string;
    CONFIG_FE_APP: string;
    ASSETS_FE_DIR: string;
    STRINF_SRC: string;
    PROFILE_FRONTEND_VITE: string;
    EXTRA_STYLE: string;
};
const ENV_GL = loadEnv(getEnv(), ROOT, '') as {
    CONFIG_STRINF: string;
    EXTRA_DIR: string;
};

const PROFILE_DIR = Path.resolve(ROOT, ENV.PROFILE_FRONTEND_VITE);
const APP_DIR = Path.resolve(ROOT, ENV.APP_FRONTEND);
const CACHE_DIR = Path.resolve(ROOT, ENV.CACHE_FE_VITE);
const SRC_DIR = Path.resolve(ROOT, ENV.STRINF_FRONTEND_SRC);
const STYLE_DIR = Path.resolve(ROOT, ENV.EXTRA_STYLE);

interface ConfLinkT {
    domain: string;
    protocol: string;
    port: number;
}

function createUrlStr({ protocol, domain, port }: ConfLinkT, urlPath: string): string {
    const extRe = urlPath[0] !== '/' ? `/${urlPath}` : urlPath;
    const main = `${protocol}://${domain}:${port}`;
    return new URL(extRe, main).href;
}

async function runPurgeCss(): Promise<void> {
    const content = [
        `${SRC_DIR}/**/*.ts`,
        `${SRC_DIR}/**/*.tsx`,
        `${SRC_DIR}/**/*.html`,
        `${STYLE_DIR}/**/*.js`,
    ];
    const results = await new PurgeCSS().purge({
        content: content,
        css: [`${APP_DIR}/**/@digidive*.css`, `${APP_DIR}/**/@icons*.css`],
    });
    await results.map(async ({ css, file }) => {
        if (file !== undefined) {
            const initS = fs.statSync(file).size / 1024;
            fs.writeFileSync(file, css);
            const newS = fs.statSync(file).size / 1024;
            console.log(`${file}: ${initS} -> ${newS} KB`);
        }
    });
}

function createCopyPath(): {
    from: string;
    to: string;
}[] {
    const path: { from: string; to: string }[] = [];
    const regex = /^COPY_FE_(.+)_FROM$/;
    for (const env in ENV) {
        const fromEnv = regex.exec(env) ?? ['_', 'null'];
        const newFrom = ENV[env];
        const newTo = ENV[`COPY_FE_${fromEnv[1]}_TO`];
        if (newTo !== undefined && newFrom !== undefined) {
            path.push({
                from: Path.resolve(ROOT, newFrom),
                to: Path.resolve(ROOT, newTo),
            });
        }
    }
    return path;
}

function crFEConfEnv(): [ConfLinkT, string] {
    const glConf = JSON.parse(
        fs.readFileSync(Path.resolve(ROOT, ENV_GL.CONFIG_STRINF)).toString()
    );
    const [fe_dom, fe_pro, fe_por] = [
        glConf.frontend.web.domain,
        glConf.frontend.web.protocol,
        glConf.frontend.web.port,
    ];
    process.env['VITE_FEC_KEY_LEN'] = glConf.model.index.key_len;
    process.env['VITE_FEC_BE_DOMAIN'] = glConf.backend.web.domain;
    process.env['VITE_FEC_BE_PROTOCOL'] = glConf.backend.web.protocol;
    process.env['VITE_FEC_BE_PORT'] = glConf.backend.web.port;
    process.env['VITE_FEC_FE_DOMAIN'] = fe_dom;
    process.env['VITE_FEC_FE_PROTOCOL'] = fe_pro;
    process.env['VITE_FEC_FE_PORT'] = fe_por;
    process.env['VITE_FEC_ST_ENABLE'] = glConf.frontend.statistic.enable;
    process.env['VITE_FEC_ST_ID'] = glConf.frontend.statistic.id;
    process.env['VITE_FEC_ST_DOMAIN'] = glConf.frontend.statistic.domain;
    process.env['VITE_FEC_ST_PW_DOMAIN'] = glConf.frontend.statistic.matomo.domain;
    process.env['VITE_FEC_ST_PW_PROTOCOL'] = glConf.frontend.statistic.matomo.protocol;
    process.env['VITE_FEC_ST_PW_PORT'] = glConf.frontend.statistic.matomo.port;
    return [
        {
            domain: String(fe_dom),
            protocol: String(fe_pro),
            port: Number(fe_por),
        },
        String(glConf.frontend.web.sitemap),
    ];
}

function copyFromTargets(): void {
    const targets = createCopyPath();
    fs.mkdirSync(APP_DIR, { recursive: true });
    for (const path of targets) {
        fs.cpSync(path.from, path.to, { recursive: true });
    }
}

function siteMap(frontEnd: ConfLinkT): string {
    return `<?xml version="1.0" encoding = "UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" >
<url><loc>${createUrlStr(frontEnd, UIApiCon.index)}</loc></url>
<url><loc>${createUrlStr(frontEnd, UIApiCon.about)}</loc></url>
<url><loc>${createUrlStr(frontEnd, UIApiCon.manual)}</loc></url>
<url><loc>${createUrlStr(frontEnd, UIApiCon.contact)}</loc></url>
<url><loc>${createUrlStr(frontEnd, UIApiCon.news)}</loc></url>
<url><loc>${createUrlStr(frontEnd, UIApiCon.service)}</loc></url>
<url><loc>${createUrlStr(frontEnd, UIApiCon.imprint)}</loc></url>
<url><loc>${createUrlStr(frontEnd, UIApiCon.strReg)}</loc></url>
</urlset>`;
}

function createSiteMapWeb(uiApi: ConfLinkT, sitemap: string): void {
    const configF = Path.resolve(ROOT, ENV.APP_FRONTEND, sitemap);
    fs.mkdirSync(Path.dirname(configF), { recursive: true });
    fs.writeFileSync(configF, siteMap(uiApi));
}

function copyToOut(): void {
    console.log('copy files');
    copyFromTargets();
    console.log('copy public conf');
    const [uiApi, sitemap] = crFEConfEnv();
    console.log('create sitemap web');
    createSiteMapWeb(uiApi, sitemap);
}

function addCspHeaders(): OutgoingHttpHeaders {
    const glConf = JSON.parse(
        fs.readFileSync(Path.resolve(ROOT, ENV_GL.CONFIG_STRINF)).toString()
    );
    const {
        backend: {
            web: { protocol, port, domain },
            statistic: { matomo },
        },
    } = glConf;
    const backUrl = `${protocol}://${domain}:${port}`;
    const statUrl = matomo;
    return {
        'Content-Security-Policy': [
            "object-src 'none'",
            `connect-src 'self' ${backUrl} ${statUrl}`,
            `default-src 'self' 'nonce-${getNonceSub()}'`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "media-src 'self' data:",
            'frame-src youtube.com www.youtube.com',
        ].join(';'),
    };
}

const ALIAS: {
    [key: string]: string;
} = {
    react: 'preact/compat',
    'react-dom/test-utils': 'preact/test-utils',
    'react-dom': 'preact/compat', // Must be below test-utils
    'react/jsx-runtime': 'preact/jsx-runtime',
    '@strinf': SRC_DIR,
    '@extra': Path.resolve(ROOT, ENV_GL.EXTRA_DIR),
    '@assets': Path.resolve(ROOT, ENV.ASSETS_FE_DIR),
};

function mapAlias(path: string): string {
    for (const ala in ALIAS) {
        if (path.startsWith(ala)) {
            return path.replace(new RegExp(`^${ala}`), ALIAS[ala]);
        }
    }
    return path;
}

function createBuild(): UserConfig {
    return {
        build: {
            write: true,
            outDir: `../../../${ENV.APP_FRONTEND}`,
            assetsDir: './assets',
            assetsInlineLimit: 8 * 1024,
            cssCodeSplit: true,
            emptyOutDir: false,
            sourcemap: false,
            manifest: false,
            ssr: false,
            minify: 'esbuild' as const,
            cssMinify: 'lightningcss' as const,
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        for (const conR in RESOURCES_PATH) {
                            if (id.startsWith(mapAlias(conR))) {
                                return RESOURCES_PATH[conR](id);
                            }
                        }
                        if (id.includes('digidive')) {
                            return '@digidive';
                        }
                        if (id.includes('@phosphor-icons')) {
                            return '@icons';
                        }
                        return undefined;
                    },
                    assetFileNames: `assets/[name]-${TIME_STAMP}-[hash][extname]`,
                    chunkFileNames: `assets/[name]-${TIME_STAMP}-[hash].js`,
                    entryFileNames: `assets/@index-[name]-${TIME_STAMP}-[hash].js`,
                },
                plugins: [
                    rollupPluginLicense({
                        sourcemap: false,
                        thirdParty: {
                            includePrivate: true,
                            multipleVersions: false,
                            output: Path.resolve(APP_DIR, 'LICENSE.vendor.txt'),
                        },
                    }),
                ].concat(
                    getBench() === 'true'
                        ? [
                              visualizer({
                                  filename: Path.resolve(
                                      PROFILE_DIR,
                                      'rollup_stats.tree.html'
                                  ),
                                  open: false,
                                  gzipSize: true,
                                  brotliSize: true,
                                  template: 'treemap' as const,
                              }),
                          ]
                        : []
                ),
            },
        },
    };
}

function createShared(build: boolean): UserConfig {
    return {
        root: Path.resolve(ROOT, ENV.STRINF_FRONTEND_SRC),
        html: { cspNonce: getNonceSub() },
        envDir: LOCAL_DIR,
        base: '/',
        appType: 'spa' as const,
        cacheDir: CACHE_DIR,
        envPrefix: 'VITE_',
        resolve: {
            extensions: ['.tsx', '.jsx', '.ts', '.js'],
            alias: ALIAS,
        },
        css: {
            transformer: 'lightningcss',
            lightningcss: {
                targets: browserslistToTargets(
                    browserslist('last 2 versions, not dead, > 0.2%')
                ),
            },
        },
        json: {
            stringify: true,
            namedExports: false,
        },
        assetsInclude: [
            '**/*.woff2?',
            '**/*.eot',
            '**/*.ttf',
            '**/*.otf',
            '**/*.jpe?g',
            '**/*.png',
            '**/*.svg',
            '**/*.webp',
        ],
        logLevel: 'info' as const,
        clearScreen: false,
        esbuild: {
            banner: '/*! LICENSE: see /LICENSE.vendor.txt */',
            legalComments: 'external' as const,
        },
        plugins: [
            preact({ devToolsEnabled: !build }),
            mdx({
                jsxImportSource: 'preact' as const,
                remarkPlugins: [RemGfm, RemImg],
                rehypePlugins: [RehHig],
            }),
            // TODO readd when workers are supported
            //legacy({
            //    targets: ['last 2 versions, not dead, > 0.2%'],
            //}),
            {
                name: 'purgecss',
                async closeBundle() {
                    console.log('finished build');
                    if (build && getPurgeCss() === 'true') {
                        console.log('starting purge css');
                        await runPurgeCss();
                        console.log('purge finished');
                    }
                },
            },
            ViteImageOptimizer(),
        ],
    };
}

function createDefaultServer(
    port: number,
    headers: OutgoingHttpHeaders
): PreviewOptions | ServerOptions {
    return {
        host: '0.0.0.0',
        port,
        strictPort: true,
        fs: { strict: false },
        headers,
    };
}

function createPreview(): UserConfig {
    return { preview: createDefaultServer(getPreviewPort(), addCspHeaders()) };
}

function createServer(): UserConfig {
    return {
        server: {
            ...createDefaultServer(getDevPort(), {}),
            watch: {
                ignored: [
                    '**/vendor/**',
                    '**/node_modules/**',
                    `!**/${ENV.STRINF_SRC}/**`,
                ],
            },
        },
        publicDir: Path.resolve(ROOT, ENV.APP_FRONTEND),
    };
}

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
    console.log(ROOT, command, `MODE: ${mode}`, isSsrBuild, isPreview);
    console.log('NODE_ENV:', getEnv());
    console.log('BENCHMARK:', getBench());
    copyToOut();
    if (isStage()) {
        process.env['VITE_STAGE'] = 'true';
    }
    let [preview, server] = [{}, {}];
    if (command === 'serve' && !(isPreview ?? false)) {
        server = createServer();
        console.log(server);
    }
    if (isPreview ?? false) {
        preview = createPreview();
        console.log(preview);
    }
    const config: UserConfig = {
        ...createShared(command === 'build'),
        ...createBuild(),
        ...server,
        ...preview,
    };
    return config;
});
