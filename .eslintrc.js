module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier-vue/recommended'
  ],
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  rules: {
    'prettier-vue/prettier': 'error',
    camelcase: 'error',
    'no-console': 'warn'
  }
}
