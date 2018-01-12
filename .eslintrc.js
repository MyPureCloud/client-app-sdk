module.exports = {
    root: true,

    extends: 'standard',

    env: {
        node: false // Opt-in per file to node env, globals, etc.
    },

    rules: {
        semi: ['error', 'always'],
        'no-extra-semi': 'error',
        indent: ['error', 4, { 'SwitchCase': 1 }],
        'space-before-function-paren': ['error',
            {
                'anonymous': 'always',
                'named': 'never'
            }
        ]
    }
};
