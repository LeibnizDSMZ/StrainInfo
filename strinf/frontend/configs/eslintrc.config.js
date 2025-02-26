import conf_js from '@eslint/js';
import pl_ts from '@typescript-eslint/eslint-plugin';
import * as pa_ts from '@typescript-eslint/parser';
import pl_jsx from 'eslint-plugin-jsx-a11y';
import pl_react from 'eslint-plugin-react';
import pl_react_hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import eslintPluginImportX from 'eslint-plugin-import-x';
import * as tsResolver from 'eslint-import-resolver-typescript';
import process from 'node:process';

export default [
    conf_js.configs.recommended,
    eslintPluginImportX.flatConfigs.recommended,
    eslintPluginImportX.flatConfigs.typescript,
    {
        files: ['**/src/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: pa_ts,
            globals: {
                ...globals.browser,
                ...globals.node,
                // for local d.ts
                JSX: 'readonly',
                OnErrorEventHandlerNoNull: 'readonly',
                // for bun
                Timer: 'readonly',
                // for external style
                StyleT: 'readonly',
            },
            parserOptions: {
                ecmaFeatures: {
                    modules: true,
                    impliedStrict: true,
                    jsx: true,
                },
                project: ['tsconfig.app.json'],
            },
        },
        plugins: {
            '@typescript-eslint': pl_ts,
            'jsx-a11y': pl_jsx,
            react: pl_react,
            'react-hooks': pl_react_hooks,
        },
        rules: {
            ...pl_ts.configs.all.rules,
            '@typescript-eslint/no-magic-numbers': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            'max-params': 'off',
            '@typescript-eslint/max-params': ['error', { max: 5 }],
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'explicit',
                    overrides: {
                        accessors: 'off',
                        constructors: 'no-public',
                        methods: 'explicit',
                        properties: 'explicit',
                        parameterProperties: 'explicit',
                    },
                },
            ],
            '@typescript-eslint/member-ordering': 'off',
            '@typescript-eslint/require-array-sort-compare': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            '@typescript-eslint/switch-exhaustiveness-check': 'warn',
            '@typescript-eslint/no-deprecated': 'warn',
            ...pl_jsx.configs.recommended.rules,
            'jsx-a11y/click-events-have-key-events': 'off',
            'jsx-a11y/no-static-element-interactions': 'off',
            'jsx-a11y/anchor-is-valid': 'off',
            ...pl_react.configs.recommended.rules,
            ...pl_react_hooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            complexity: ['error', { max: 12 }],
            '@typescript-eslint/no-base-to-string': 'warn',
            '@typescript-eslint/no-unsafe-type-assertion': 'warn',
            'import-x/no-unresolved': [
                'error',
                process.env['GITHUB_WORKER'] !== undefined
                    ? {
                          ignore: ['^@extra/straininfo/.+', '^digidive(/.+)?'],
                      }
                    : {},
            ],
        },
        settings: {
            'import-x/resolver': {
                name: 'tsResolver',
                resolver: tsResolver,
                options: { alwaysTryTypes: true, project: 'tsconfig.app.json' },
            },
            react: {
                pragma: 'h',
                version: '16.0',
            },
        },
    },
];
