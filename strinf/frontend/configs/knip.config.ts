export default {
    entry: ['src/index.tsx'],
    project: ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,mdx,md}'],
    ignore: ['configs/**', 'assets/**', 'src/**/worker*.ts'],
    ignoreDependencies: [
        'sharp',
        'svgo',
        '@mdx-js/mdx',
        /^@typescript-eslint\/.+/,
        /^typescript-plugin.+/,
        /^@?eslint.*/,
        /^@extra\/straininfo\/.+$/,
    ],
    ignoreBinaries: ['knip', 'eslint', 'tsc', 'vite'],
    compilers: {
        css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
        yaml: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
    },
};
