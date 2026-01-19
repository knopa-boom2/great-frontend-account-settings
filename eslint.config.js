import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            react,
            'react-hooks': reactHooks,
        },
        rules: {
            // Note: Formatting rules are handled by Prettier
            // ESLint focuses on code quality and logic errors

            // TypeScript specific
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],

            // React specific
            'react/react-in-jsx-scope': 'off', // Not needed with React 17+
            'react/prop-types': 'off', // Using TypeScript for prop validation
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // General code quality
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        ignores: ['node_modules/**', 'dist/**', '*.config.js', '*.config.ts'],
    },
    prettierConfig,
];
