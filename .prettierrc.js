module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  overrides: [
    // configuration for html files with: organization of tag attributes and tailwind css classes
    {
      files: '*.html',
      options: {
        parser: 'angular',
        printWidth: 150,
        plugins: [
          require.resolve('prettier-plugin-organize-attributes'),
          require.resolve('prettier-plugin-tailwindcss')
        ],
        attributeGroups: [
          '$ANGULAR_ELEMENT_REF',
          '^mat',
          '$CODE_GUIDE',
          '^[a-z]',
          '$ANGULAR'
        ]
      }
    },
    // configuration for ts and js files with: sorting of imports and arrays wrapping
    {
      files: [
        '*.ts',
        '*.js'
      ],
      options: {
        plugins: [
          require.resolve('@trivago/prettier-plugin-sort-imports'),
          require.resolve('prettier-plugin-multiline-arrays')
        ],
        importOrder: [
          '^@angular/(.*)$',
          '^@(.*)$',
          '<THIRD_PARTY_MODULES>',
          '^./(?!.*model$)(?!.*entity$)(?!.*component$)(?!.*service$)(?!.*directive$)(?!.*pipe$)(?!.*module$).*$',
          '.*.model$',
          '.*.entity$',
          '.*.component$',
          '.*.service$',
          '.*.directive$',
          '.*.pipe$',
          '.*.module$'
        ],
        importOrderSeparation: true,
        importOrderSortSpecifiers: true,
        importOrderParserPlugins: [
          'typescript',
          'decorators-legacy'
        ],
        multilineArraysWrapThreshold: 1
      }
    }
  ]
};
