import antfu from '@antfu/eslint-config';
import tsParser from '@typescript-eslint/parser';

export default antfu(
    {
        stylistic: {
            indent: 4,
            quotes: 'single',
            semi: true,
        },
        typescript: true,
        jsonc: true,
        yaml: true,
        react: true,
        ignores: ['**/configs', 'vite.config.ts'],
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.app.json',
                parser: tsParser,
            },
        },
    },
    {
        files: ['**/src/**/*.{js,jsx,ts,tsx}'],
        rules: {
            // react
            'react-refresh/only-export-components': 'off',
            'react/no-array-index-key': 'off',
            // Example TypeScript rule overrides
            'ts/no-magic-numbers': 'off',
            'ts/explicit-function-return-type': 'off',
            'ts/naming-convention': 'off',
            'ts/prefer-readonly-parameter-types': 'off',
            'ts/no-unsafe-assignment': 'off',
            'ts/no-unsafe-member-access': 'off',
            'max-params': 'off',
            'ts/max-params': ['error', { max: 5 }],
            'ts/explicit-member-accessibility': [
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
            'ts/member-ordering': 'off',
            'ts/require-array-sort-compare': 'off',
            'ts/restrict-template-expressions': 'off',
            'ts/no-use-before-define': 'off',
            'ts/no-unsafe-enum-comparison': 'off',
            'ts/switch-exhaustiveness-check': 'warn',
            'ts/no-deprecated': 'warn',
            complexity: ['error', { max: 18 }],
            'ts/no-base-to-string': 'warn',
            'ts/no-unsafe-type-assertion': 'warn',
            'no-console': 'warn',
        },
    }
);
