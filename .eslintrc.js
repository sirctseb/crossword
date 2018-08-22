module.exports = {
  extends: 'airbnb-base',
  plugins: [
    'import',
    'react',
    'babel',
  ],
  rules: {
    indent: ['error', 2],
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'react/react-in-jsx-scope': 1,
    'import/prefer-default-export': 0,
    'class-methods-use-this': [1, {
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
    }],
    'comma-dangle': ['error', 'always-multiline'],
  },
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
  },
};
