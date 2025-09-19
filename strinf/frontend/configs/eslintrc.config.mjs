import antfu from '@antfu/eslint-config';
import * as tsResolver from 'eslint-import-resolver-typescript';

export default antfu(
    {
        stylistic: {
            indent: 4,
            quotes: 'single',
            semi: true,
        },
        typescript: {
            tsconfigPath: 'tsconfig.app.json',
        },
        jsonc: true,
        yaml: true,
        react: true,
        ignores: ['**/configs'],
    },
    {
        files: ['**/src/**/*.{js,jsx,ts,tsx}'],
        rules: {
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
    },
    {
        settings: {
            'import/resolver': {
                name: 'tsResolver',
                resolver: tsResolver,
                options: { alwaysTryTypes: true, project: 'tsconfig.app.json' },
            },
        },
    }
);
