import { BeforeAll, AfterAll, After } from '@cucumber/cucumber'
import fs from 'node:fs'
import config from '../config/config.js'

import { BaseAPI } from '../apis/base-api.js'
import { setGlobalDispatcher } from 'undici'
import { Interpolator } from './interpolator.js'

let agent
let dbConnector
let dbClient
let baseAPI
let interpolator

BeforeAll(async function () {
  dbConnector = config.dbConnector
  dbClient = await dbConnector.connect()
  baseAPI = new BaseAPI()
  interpolator = new Interpolator()
  agent = config.undiciAgent
  setGlobalDispatcher(agent)
})

AfterAll(async function () {
  await agent.close()
  await dbConnector.disconnect()
})

After(async function (scenario) {
  if (scenario.result.status === 'FAILED') {
    const failureMessage = `${new Date().toISOString()} - FAILED: ${scenario.pickle.name} - ${scenario.result.message}\n`
    await fs.appendFileSync('FAILED', failureMessage)
  }
})

export { dbClient, baseAPI, interpolator }
