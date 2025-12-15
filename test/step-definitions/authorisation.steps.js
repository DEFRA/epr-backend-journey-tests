import { Given, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import { authClient, baseAPI, defraIdStub } from '../support/hooks.js'
import { FormData } from 'undici'
import config from '../config/config.js'
import { randomUUID } from 'crypto'

Given('I register a User to use the system', async function () {
  this.userId = '86a7607c-a1e7-41e5-a0b6-a41680d05a2a'

  if (!defraIdStub.accessTokens.has(this.userId)) {
    const user = {
      userId: this.userId,
      email: 'alice.smith@ecorecycle.com',
      firstName: 'Alice',
      lastName: 'Smith',
      loa: '1',
      aal: '1',
      enrolmentCount: 1,
      enrolmentRequestCount: 1
    }
    await defraIdStub.register(JSON.stringify(user))
  }
})

Given('I add a relationship to the User', async function () {
  const userId = this.userId

  if (!defraIdStub.accessTokens.has(this.userId)) {
    const params = new URLSearchParams({
      csrfToken: randomUUID(),
      userId,
      relationshipId: 'relId',
      organisationId: '2dee1e31-5ac6-4bc4-8fe0-0820f710c2b1',
      organisationName: 'ACME ltd',
      relationshipRole: 'role',
      roleName: 'User',
      roleStatus: 'Status',
      // eslint-disable-next-line camelcase
      redirect_uri: 'http://localhost:3000/'
    })

    const resp = await defraIdStub.addRelationship(params.toString(), userId)
    expect(resp.statusCode).to.equal(302)
  }
})

When('I authorise the User', async function () {
  if (!defraIdStub.accessTokens.has(this.userId)) {
    const payload = {
      user: 'alice.smith@ecorecycle.com',
      // eslint-disable-next-line camelcase
      client_id: '63983fc2-cfff-45bb-8ec2-959e21062b9a',
      // eslint-disable-next-line camelcase
      response_type: 'code',
      // eslint-disable-next-line camelcase
      redirect_uri: 'http://0.0.0.0:3001/health',
      state: 'state',
      scope: 'email'
    }
    const response = await defraIdStub.authorise(payload)
    this.sessionId = response.split('sessionId=')[1]
  }
})

When('I generate the token', async function () {
  if (!defraIdStub.accessTokens.has(this.userId)) {
    const payload = {
      // eslint-disable-next-line camelcase
      client_id: '63983fc2-cfff-45bb-8ec2-959e21062b9a',
      // eslint-disable-next-line camelcase
      client_secret: 'test_value',
      // eslint-disable-next-line camelcase
      grant_type: 'authorization_code',
      code: `${this.sessionId}`
    }
    const token = await defraIdStub.generateToken(JSON.stringify(payload))
    defraIdStub.accessTokens.set(this.userId, token)
  }
})

When(
  'the User is linked to the organisation with id {string}',
  async function (organisationId) {
    if (!defraIdStub.linked.has(organisationId)) {
      this.response = await baseAPI.post(
        `/v1/organisations/${organisationId}/link`,
        '',
        defraIdStub.authHeader()
      )
      defraIdStub.linked.set(this.userId, organisationId)
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
