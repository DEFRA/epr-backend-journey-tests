import { BeforeAll, AfterAll, After } from '@cucumber/cucumber'
import fs from 'node:fs'
import config from '../config/config.js'

import { BaseAPI } from '../apis/base-api.js'
import { setGlobalDispatcher } from 'undici'
import { Interpolator } from './interpolator.js'
import { AuthClient } from '../support/auth.js'
import { ObjectId } from 'mongodb'

let agent
let dbConnector
let dbClient
let authClient
let baseAPI
let interpolator

//TODO: Remove this method once we get a working validated payload
async function setupValidatedPayload() {
  if (!process.env.ENVIRONMENT) {
    const collection = dbClient.collection('epr-organisations')
    const data = JSON.parse(
      fs.readFileSync('./test/fixtures/validated-payload.json', 'utf8')
    )

    await collection.replaceOne({ _id: new ObjectId(data.id) }, data, {
      upsert: true
    })
  }
}

BeforeAll(async function () {
  dbConnector = config.dbConnector
  dbClient = await dbConnector.connect()
  baseAPI = new BaseAPI()
  authClient = new AuthClient()
  interpolator = new Interpolator()
  agent = config.undiciAgent
  setGlobalDispatcher(agent)

  await setupValidatedPayload()
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

export { dbClient, authClient, baseAPI, interpolator }
