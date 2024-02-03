// eslint-disable-next-line no-undef
module.exports = {
  extends: [
    'eslint:recommended',
  ],
  env: {
    // Your environments (which contains several predefined global variables)
    'node': true,
  },
  globals: {
    // Your global variables (setting to false means it's not allowed to be reassigned)
    //
    // myGlobal: false
  },
  rules: {
    // Customize your rules
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'never'],
    'no-console': ['error'],
    'indent': ['error', 2],
  }
}