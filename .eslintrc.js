module.exports = {
  root: true,
  env: {
    browser: true,
    mocha: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
    // 'plugin:compat/recommended',
    // 'plugin:jsx-a11y/recommended',
  ],
  plugins: ['@typescript-eslint', 'eslint-plugin-react', 'jsx-a11y', 'mocha', 'prettier'],
  rules: {
    eqeqeq: ['error', 'always'],
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'react/react-in-jsx-scope': 1,
    'import/prefer-default-export': 0,
    'class-methods-use-this': [
      1,
      {
        exceptMethods: [
          'componentDidMount',
          'componentDidUpdate',
          'componentWillMount',
          'componentWillReceiveProps',
          'componentWillUnmount',
          'componentWillUpdate',
          'render',
          'shouldComponentUpdate',
        ],
      },
    ],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2019,
    sourceType: 'module',
  },
};
