import { BeforeAll, AfterAll, After } from '@cucumber/cucumber'
import fs from 'node:fs'
import { StubConnector, MongoConnector } from './db.js'

import { BaseAPI } from '../apis/base-api.js'

let dbConnector
let dbClient
let baseAPI

BeforeAll(async function () {
  dbConnector = process.env.ENVIRONMENT
    ? new StubConnector()
    : new MongoConnector()
  dbClient = await dbConnector.connect()
  baseAPI = new BaseAPI()
})

AfterAll(async function () {
  await dbConnector.disconnect()
})

After(async function (scenario) {
  if (scenario.result.status === 'FAILED') {
    const failureMessage = `${new Date().toISOString()} - FAILED: ${scenario.pickle.name} - ${scenario.result.message}\n`
    await fs.appendFileSync('FAILED', failureMessage)
  }
})

export { dbClient, baseAPI }
