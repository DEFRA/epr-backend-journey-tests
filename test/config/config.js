import { Agent, ProxyAgent } from 'undici'
import { CognitoAuth } from '../support/cognito-auth.js'
import { CognitoStub } from '../support/cognito-stub.js'
import { MongoConnector, StubConnector } from '../support/db.js'

const environment = process.env.ENVIRONMENT
const withProxy = process.env.WITH_PROXY
const withExternalProxy = process.env.WITH_EXTERNAL_PROXY
const withoutLogs = process.env.WITHOUT_LOGS
const xApiKey = process.env.X_API_KEY

if (environment === 'prod') {
  throw new Error(
    'The test suite is not meant to be run against the prod Environment!'
  )
}

const interval = process.env.ENVIRONMENT ? 2000 : 500
const pollTimeout = process.env.ENVIRONMENT ? 60000 : 30000

const api = {
  local: withProxy ? 'http://epr-backend:3001' : 'http://localhost:3001',
  env: `https://epr-backend.${environment}.cdp-int.defra.cloud`,
  envFromLocal: `https://ephemeral-protected.api.${environment}.cdp-int.defra.cloud/epr-backend`,
  headers: xApiKey ? { 'x-api-key': xApiKey } : {}
}

const localstackHost = {
  local: withProxy ? 'localstack' : 'localhost'
}

const proxy = process.env.HTTP_PROXY
  ? new ProxyAgent({
      uri: process.env.HTTP_PROXY
    })
  : new ProxyAgent({
      uri: 'http://localhost:7777',
      proxyTunnel: !!environment,
      requestTls: {
        rejectUnauthorized: false
      }
    })

const database = {
  stub: new StubConnector(),
  mongo: new MongoConnector()
}

const agent = new Agent({
  connections: 10,
  pipelining: 0,
  headersTimeout: 30000,
  bodyTimeout: 30000
})

const auth = {
  local: withProxy
    ? 'http://epr-re-ex-entra-stub:3010'
    : 'http://localhost:3010',
  env:
    environment === 'test'
      ? 'https://login.microsoftonline.com/6f504113-6b64-43f2-ade9-242e05780007/oauth2/v2.0/token'
      : `https://epr-re-ex-entra-stub.${environment}.cdp-int.defra.cloud`,
  // Below configuration only applies for "Test" environment
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  clientId: 'bd06da51-53f6-46d0-a9f0-ac562864c887',
  username: process.env.AUTH_USERNAME,
  password: process.env.AUTH_PASSWORD,
  nonServiceUsername: process.env.NON_SERVICE_AUTH_USERNAME,
  nonServicePassword: process.env.NON_SERVICE_PASSWORD,
  scope: 'api://bd06da51-53f6-46d0-a9f0-ac562864c887/.default',
  grantType: 'password'
}

const defraId = {
  local: 'http://defra-id-stub:3200',
  env: `https://cdp-defra-id-stub.${environment}.cdp-int.defra.cloud`
}

const cdpUploader = {
  local: withProxy ? 'http://cdp-uploader:7337' : 'http://localhost:7337',
  env: `https://cdp-uploader.${environment}.cdp-int.defra.cloud`
}

const cognitoAuthParams = {
  url: 'http://localhost:9229',
  envUrl: process.env.COGNITO_URL,
  clientId:
    environment === 'test'
      ? process.env.COGNITO_CLIENT_ID
      : '5357lgchj0h0fuomqyas5r87u',
  username: 'hello@example.com',
  password:
    environment === 'test' ? process.env.COGNITO_CLIENT_SECRET : 'testPassword'
}

const cognito = {
  local: new CognitoStub(cognitoAuthParams),
  env: new CognitoAuth({
    clientId: cognitoAuthParams.clientId,
    clientSecret: cognitoAuthParams.password,
    cognitoUrl: cognitoAuthParams.envUrl
  })
}

const dockerLogParser = {
  containerName: 'epr-backend-journey-tests-epr-backend-1'
}

const mongoUri = 'mongodb://localhost:27017/epr-backend'

const testLogs = !withoutLogs && !environment

let globalUndiciAgent = agent
if (withExternalProxy || withProxy || process.env.HTTP_PROXY) {
  globalUndiciAgent = proxy
}

const dbConnector = !environment ? database.mongo : database.stub
let apiUri
let authUri
let defraIdUri
let cdpUploaderUri
let cognitoAuth

if (!environment) {
  apiUri = api.local
  authUri = auth.local
  defraIdUri = defraId.local
  cdpUploaderUri = cdpUploader.local
  cognitoAuth = cognito.local
} else {
  apiUri = api.env
  authUri = auth.env
  cdpUploaderUri = cdpUploader.env
  defraIdUri = defraId.env
  cognitoAuth = cognito.env
}

if (xApiKey) {
  apiUri = api.envFromLocal
}

export default {
  apiHeaders: api.headers,
  apiUri,
  auth,
  authUri,
  cdpUploaderUri,
  cognitoAuth,
  dbConnector,
  defraIdUri,
  dockerLogParser,
  interval,
  localstackHost,
  mongoUri,
  pollTimeout,
  testLogs,
  undiciAgent: globalUndiciAgent
}
