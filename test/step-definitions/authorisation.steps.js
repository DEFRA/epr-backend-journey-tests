import { Given, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import {
  authClient,
  eprBackendAPI,
  defraIdStub,
  users
} from '../support/hooks.js'
import { FormData } from 'undici'
import config from '../config/config.js'

Given(
  'I register a {string} User to use the system',
  async function (userType) {
    const user =
      userType === 'Reprocessor (Input) / Exporter'
        ? users.reprocessorInputAndExporterUser
        : users.reprocessorOutputUser
    this.userId = user.userId
    this.email = user.email
    if (!defraIdStub.accessTokens.has(this.userId)) {
      await defraIdStub.register(JSON.stringify(user))
    }
  }
)

Given('I register a User to use the system', async function () {
  const user = await users.userPayload(this.email)

  this.userId = user.userId
  if (!defraIdStub.accessTokens.has(this.userId)) {
    await defraIdStub.register(JSON.stringify(user))
  }
})

Given('I add a relationship to the User', async function () {
  const userId = this.userId
  const params = await users.userParams(this.userId)

  if (!defraIdStub.accessTokens.has(this.userId)) {
    const resp = await defraIdStub.addRelationship(params.toString(), userId)
    expect(resp.statusCode).to.equal(302)
  }
})

Given('I add a relationship to the {string} User', async function (userType) {
  const params =
    userType === 'Reprocessor (Input) / Exporter'
      ? users.reprocessorInputAndExporterUserParams
      : users.reprocessorOutputUserParams
  const userId = this.userId

  if (!defraIdStub.accessTokens.has(this.userId)) {
    const resp = await defraIdStub.addRelationship(params.toString(), userId)
    expect(resp.statusCode).to.equal(302)
  }
})

When('I authorise the User', async function () {
  if (!defraIdStub.accessTokens.has(this.userId)) {
    const payload = await users.authorisationPayload(this.email)

    const response = await defraIdStub.authorise(payload)
    this.sessionId = response.split('sessionId=')[1]
  }
})

When('I generate the token', async function () {
  if (!defraIdStub.accessTokens.has(this.userId)) {
    const payload = await users.tokenPayload(this.sessionId)
    await defraIdStub.generateToken(JSON.stringify(payload), this.userId)
  }
})

When(
  'the User is linked to the organisation with id {string}',
  async function (organisationId) {
    if (!defraIdStub.linked.has(organisationId)) {
      this.response = await eprBackendAPI.post(
        `/v1/organisations/${organisationId}/link`,
        '',
        defraIdStub.authHeader(this.userId)
      )
      defraIdStub.linked.set(organisationId, this.userId)
    }
  }
)

When(
  'the User is linked to the recently migrated organisation',
  async function () {
    const organisationId = this.orgResponseData?.referenceNumber

    this.response = await eprBackendAPI.post(
      `/v1/organisations/${organisationId}/link`,
      '',
      defraIdStub.authHeader(this.userId)
    )
    if (this.response.statusCode === 200) {
      defraIdStub.linked.set(organisationId, this.userId)
    }
  }
)

When(
  'I register and authorise a new User with email {string}',
  async function (email) {
    const user = await users.userPayload(email)
    this.userId = user.userId
    if (!defraIdStub.accessTokens.has(this.userId)) {
      await defraIdStub.register(JSON.stringify(user))

      const params = await users.userParams(this.userId)
      const resp = await defraIdStub.addRelationship(
        params.toString(),
        this.userId
      )
      expect(resp.statusCode).to.equal(302)

      const payload = await users.authorisationPayload(email)
      const response = await defraIdStub.authorise(payload)
      this.sessionId = response.split('sessionId=')[1]

      const tokenPayload = await users.tokenPayload(this.sessionId)
      await defraIdStub.generateToken(JSON.stringify(tokenPayload), this.userId)
    }
  }
)

When(
  'I register and authorise a User and link it to the recently migrated organisation',
  async function () {
    const user = await users.userPayload(this.email)
    this.userId = user.userId
    if (!defraIdStub.accessTokens.has(this.userId)) {
      await defraIdStub.register(JSON.stringify(user))

      const params = await users.userParams(this.userId)
      const resp = await defraIdStub.addRelationship(
        params.toString(),
        this.userId
      )
      expect(resp.statusCode).to.equal(302)

      const payload = await users.authorisationPayload(this.email)
      const response = await defraIdStub.authorise(payload)
      this.sessionId = response.split('sessionId=')[1]

      const tokenPayload = await users.tokenPayload(this.sessionId)
      await defraIdStub.generateToken(JSON.stringify(tokenPayload), this.userId)

      const organisationId = this.orgResponseData?.referenceNumber

      this.response = await eprBackendAPI.post(
        `/v1/organisations/${organisationId}/link`,
        '',
        defraIdStub.authHeader(this.userId)
      )
      defraIdStub.linked.set(organisationId, this.userId)
    }
  }
)

Given('I am logged in as a service maintainer', async function () {
  let payload, urlSuffix
  if (process.env.ENVIRONMENT === 'test') {
    payload = new FormData()
    payload.append('client_id', config.auth.clientId)
    payload.append('client_secret', config.auth.clientSecret)
    payload.append('username', config.auth.username)
    payload.append('password', config.auth.password)
    payload.append('scope', config.auth.scope)
    payload.append('grant_type', config.auth.grantType)
    urlSuffix = ''
  } else {
    const clientId = 'clientId'
    const username = 'ea@test.gov.uk'
    payload = JSON.stringify({ clientId, username })
    urlSuffix = '/sign'
  }
  await authClient.generateToken(payload, urlSuffix)
})

Given('I am logged in as a non-service maintainer', async function () {
  let payload, urlSuffix
  if (process.env.ENVIRONMENT === 'test') {
    payload = new FormData()
    payload.append('client_id', config.auth.clientId)
    payload.append('client_secret', config.auth.clientSecret)
    payload.append('username', config.auth.nonServiceUsername)
    payload.append('password', config.auth.nonServicePassword)
    payload.append('scope', config.auth.scope)
    payload.append('grant_type', config.auth.grantType)
    urlSuffix = ''
  } else {
    const clientId = 'clientId'
    const username = 'customer@test.gov.uk'
    payload = JSON.stringify({ clientId, username })
    urlSuffix = '/sign'
  }
  await authClient.generateToken(payload, urlSuffix)
})
