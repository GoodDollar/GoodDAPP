module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
    ],
    plugins: ['@typescript-eslint', 'prettier', 'eslint-plugin-import'],
    parserOptions: {
        ecmaVersion: 2020,
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
    },
    ignorePatterns: ['/build/**/*', '/types/*/*d.ts', '/src/**/*.test.ts*', '/**/*.*js'],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'import/no-anonymous-default-export': [
            'error',
            {
                allowCallExpression: false,
            },
        ],
        'no-extend-native': 'off',
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'prettier/prettier': 'error',
        'prefer-const': 'warn',
        'no-constant-condition': 'off',
        'no-async-promise-executor': 'off',
    },
    settings: {
        'import/resolver': {
            node: {
                paths: ['src'],
            },
        },
        react: {
            version: 'detect',
        },
    },
}
