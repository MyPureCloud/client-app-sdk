module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    rules: {
        'semi': ['error', 'always'],
        'no-extra-semi': 'error',
        'no-unused-vars': 'off',
        'no-undef': 'off',
        'no-prototype-builtins': 'off',
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'space-before-function-paren': ['error',
            {
                'anonymous': 'always',
                'named': 'never'
            }
        ],
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        // TODO: turn these on when project is split into separate src/test folders
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
    }
};
