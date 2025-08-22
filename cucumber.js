export default {
  paths: ['test/features/**/*.feature'],
  require: ['test/step-definitions/*.js', 'test/support/*.js'],
  format: [
    'progress',
    'summary',
    ['allure-cucumberjs/reporter', 'allure-results/allure-reporter-output.txt']
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  }
}
