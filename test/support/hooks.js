import { BeforeAll, AfterAll, After } from '@cucumber/cucumber'
import fs from 'node:fs'
import config from '../config/config.js'

import { EprBackendApi } from '../apis/epr.backend.api.js'
import { setGlobalDispatcher } from 'undici'
import { Interpolator } from './interpolator.js'
import { AuthClient } from '../support/auth.js'
import { DefraIdStub } from '../support/defra-id-stub.js'
import { CDPUploader } from '../support/cdp-uploader.js'
import Users from '../support/users.js'

let agent
let dbConnector
let dbClient
let authClient
let eprBackendAPI
let interpolator
let defraIdStub
let cdpUploader
let users

BeforeAll(async function () {
  dbConnector = config.dbConnector
  dbClient = await dbConnector.connect()
  eprBackendAPI = new EprBackendApi()
  authClient = new AuthClient()
  defraIdStub = new DefraIdStub()
  users = new Users()
  interpolator = new Interpolator()
  cdpUploader = new CDPUploader()
  agent = config.undiciAgent
  setGlobalDispatcher(agent)
})

AfterAll(async function () {
  await agent.destroy()
  await dbConnector.disconnect()
})

After(async function (scenario) {
  if (scenario.result.status === 'FAILED') {
    const failureMessage = `${new Date().toISOString()} - FAILED: ${scenario.pickle.name} - ${scenario.result.message}\n`
    await fs.appendFileSync('FAILED', failureMessage)
  }
})

export {
  dbClient,
  authClient,
  defraIdStub,
  eprBackendAPI,
  interpolator,
  users,
  cdpUploader
}
