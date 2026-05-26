import { Given } from '@cucumber/cucumber'
import { basicAuth } from '../support/hooks.js'

Given('I use the default basic auth credentials', async function () {
  await basicAuth.defaultBasicAuthHeader()
})

Given('I use the following basic auth credentials', async function (dataTable) {
  const [row] = dataTable.hashes()
  await basicAuth.generateAuthHeader(row.username, row.password)
})
