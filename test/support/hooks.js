import { After, AfterAll, BeforeAll } from '@cucumber/cucumber'
import fs from 'node:fs'
import config from '../config/config.js'

import { setGlobalDispatcher } from 'undici'
import { EprBackendApi } from '../apis/epr.backend.api.js'
import { AuthClient } from '../support/auth.js'
import { CDPUploader } from '../support/cdp-uploader.js'
import { DefraIdStub } from '../support/defra-id-stub.js'
import Users from '../support/users.js'
import { CognitoStub } from './cognito-stub.js'
import { Interpolator } from './interpolator.js'

let agent
let dbConnector
let dbClient
let authClient
let eprBackendAPI
let interpolator
let defraIdStub
let cdpUploader
let cognitoStub
let users

BeforeAll({ timeout: 15000 }, async function () {
  dbConnector = config.dbConnector
  dbClient = await dbConnector.connect()
  eprBackendAPI = new EprBackendApi()
  authClient = new AuthClient()
  defraIdStub = new DefraIdStub()
  users = new Users()
  interpolator = new Interpolator()
  cognitoStub = new CognitoStub(config.cognitoAuth)
  await cognitoStub.generateToken()
  cdpUploader = new CDPUploader()
  agent = config.undiciAgent
  setGlobalDispatcher(agent)
})

AfterAll(async function () {
  await defraIdStub.expireAllUsers()
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
  authClient,
  cdpUploader,
  cognitoStub,
  dbClient,
  defraIdStub,
  eprBackendAPI,
  interpolator,
  users
}
