import { When, Then } from '@cucumber/cucumber'
import { baseAPI, authClient } from '../support/hooks.js'
import { expect } from 'chai'
import { request } from 'undici'

import config from '../config/config.js'
import { parse } from 'csv-parse/sync'

When('I request the public register', async function () {
  this.response = await baseAPI.post(
    '/v1/public-register/generate',
    '',
    authClient.authHeader()
  )
})

Then('I should see the following public register response', async function () {
  expect(this.response.statusCode).to.equal(201)
})

When('I retrieve the public register file', async function () {
  const publicRegisterResponse = await this.response.body.json()
  const url = new URL(publicRegisterResponse.downloadUrl)

  if (!process.env.ENVIRONMENT) {
    url.host = config.localstackHost.local
  }

  const publicRegisterFile = await request(url.href)
  const csvText = await publicRegisterFile.body.text()
  const records = parse(csvText, {
    columns: true
  })

  this.mapsData = records.map((row) => new Map(Object.entries(row)))
})

Then('the public register file should not be empty', async function () {
  expect(this.mapsData).length.to.be.above(0)
})

Then(
  'I should see the following public register information',
  async function (dataTable) {
    const headers = dataTable.raw()[0]
    const expectedRecords = dataTable
      .raw()
      .slice(1)
      .map((row) => {
        const map = new Map()
        headers.forEach((header, i) => {
          map.set(header, row[i])
        })
        return map
      })

    for (let i = 0; i < expectedRecords.length; i++) {
      const searchMap = expectedRecords[i]
      const found = this.mapsData.some((row) => containsAll(row, searchMap))

      if (!found) {
        const searchValues = Array.from(searchMap.entries())
          .map(([k, v]) => `${k}="${v}"`)
          .join(', ')
        throw new Error(
          `Expected Row ${i + 1} not found in CSV: ${searchValues}`
        )
      }
    }

    function containsAll(rowMap, searchMap) {
      for (const [key, value] of searchMap) {
        if (rowMap.get(key) !== value) {
          return false
        }
      }
      return true
    }
  }
)
