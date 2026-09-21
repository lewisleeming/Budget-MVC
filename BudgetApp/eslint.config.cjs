'use strict';

module.exports = [
    {
        files: ['**/*.js', 'tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                process: 'readonly',
                __dirname: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'writable',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                describe: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                beforeEach: 'readonly',
                afterAll: 'readonly',
                afterEach: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            semi: ['error', 'always'],
            quotes: ['warn', 'single', { avoidEscape: true }]
        }
    },
    {
        files: ['public/js/**/*.js'],
        languageOptions: {
            globals: {
                window: 'readonly',
                document: 'readonly',
                d3: 'readonly',
                Intl: 'readonly',
                fetch: 'readonly',
                alert: 'readonly',
                console: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'off'
        }
    },
    {
        ignores: ['node_modules/', 'coverage/', 'public/population-by-age.csv', 'eslint.config.*']
    }
];
