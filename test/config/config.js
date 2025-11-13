import { MongoConnector, StubConnector } from '../support/db.js'
import { Agent, ProxyAgent } from 'undici'

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

const api = {
  local: withProxy ? 'http://epr-backend:3001' : 'http://localhost:3001',
  env: `https://epr-backend.${environment}.cdp-int.defra.cloud`,
  envFromLocal: `https://ephemeral-protected.api.${environment}.cdp-int.defra.cloud/epr-backend`,
  headers: xApiKey ? { 'x-api-key': xApiKey } : {}
}

const zapTargetApi = {
  local: 'http://epr-backend:3001',
  env: `https://epr-backend.${environment}.cdp-int.defra.cloud`
}

const proxy = new ProxyAgent({
  uri: 'http://localhost:7777',
  proxyTunnel: !!environment,
  requestTls: {
    rejectUnauthorized: false
  }
})

const zapProxyAgent = new ProxyAgent({
  uri: 'http://localhost:7777',
  proxyTunnel: false
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

const zap = {
  uri: withProxy ? 'http://zap:8080' : 'http://localhost:8080',
  key: 'zap-api-key'
}

const auth = {
  local: withProxy
    ? 'http://epr-re-ex-entra-stub:3010'
    : 'http://localhost:3010',
  env: `https://epr-re-ex-entra-stub.${environment}.cdp-int.defra.cloud`
}

const dockerLogParser = {
  containerName: 'epr-backend-journey-tests-epr-backend-1'
}

const mongoUri = 'mongodb://localhost:27017/epr-backend'

const testLogs = !withoutLogs && !environment
const globalUndiciAgent = !withProxy && !withExternalProxy ? agent : proxy
const zapAgent = !withProxy && !withExternalProxy ? agent : zapProxyAgent
const dbConnector = !environment ? database.mongo : database.stub
let apiUri
let authUri

if (!environment) {
  apiUri = api.local
  authUri = auth.local
} else if (xApiKey) {
  apiUri = api.envFromLocal
  authUri = auth.env
} else {
  apiUri = api.env
  authUri = auth.env
}

const zapTargetApiUri = !environment ? zapTargetApi.local : zapTargetApi.env

export default {
  dbConnector,
  mongoUri,
  apiUri,
  zapTargetApiUri,
  testLogs,
  dockerLogParser,
  zap,
  authUri,
  zapAgent,
  undiciAgent: globalUndiciAgent,
  apiHeaders: api.headers
}
