import neostandard from 'neostandard'

const ns = neostandard({
  env: ['node', 'es2022', 'jest'],
  files: ['test/**/*.js'],
  ignores: [
    ...neostandard.resolveIgnoresFromGitignore(),
    'allure-results/',
    'allure-report/',
    'docker/'
  ],
  noJsx: true,
  noStyle: true
})

// Fix to override ecmaVersion for import attributes support, see related issue:
// https://github.com/neostandard/neostandard/issues/307
for (const item of ns) {
  if (item?.languageOptions?.ecmaVersion < 2025) {
    item.languageOptions.ecmaVersion = 2025
  }
}

export default [
  ...ns,
  {
    rules: {
      camelcase: [
        'error',
        {
          allow: ['^faker[A-Z]{2}_[A-Z]{2}$', 'step_definition', 'zap_alert']
        }
      ]
    }
  }
]
