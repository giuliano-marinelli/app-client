module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    '^@angular/(.*)$',
    '^@(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^./(?!.*model$)(?!.*component$)(?!.*service$)(?!.*directive$)(?!.*pipe$)(?!.*module$).*$',
    '.*.model$',
    '.*.component$',
    '.*.service$',
    '.*.directive$',
    '.*.pipe$',
    '.*.module$'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'decorators-legacy']
};
