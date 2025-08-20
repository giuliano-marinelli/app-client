module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  overrides: [{ files: '*.html', options: { parser: 'angular' } }],
  plugins: [
    require.resolve('prettier-plugin-organize-imports'),
    require.resolve('prettier-plugin-organize-attributes'),
    require.resolve('prettier-plugin-multiline-arrays'),
    require.resolve('prettier-plugin-tailwindcss')
  ],
  multilineArraysWrapThreshold: 1
};
