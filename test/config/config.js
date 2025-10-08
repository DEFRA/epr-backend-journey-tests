import { Agent, ProxyAgent } from 'undici'
import { MongoConnector, StubConnector } from '../support/db.js'

const environment = process.env.ENVIRONMENT
const withProxy = process.env.WITH_PROXY
const withoutLogs = process.env.WITHOUT_LOGS

if (environment === 'prod') {
  throw new Error(
    'The test suite is not meant to be run against the prod Environment!'
  )
}

const api = {
  local: 'http://localhost:3001',
  env: `https://epr-backend.${environment}.cdp-int.defra.cloud`
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
  uri: 'http://localhost:8080',
  key: 'zap-api-key'
}

const dockerLogParser = {
  containerName: 'epr-backend-journey-tests-epr-backend-1',
  fallbackContainerName: 'epr-backend-epr-backend-1'
}

const mongoUri = 'mongodb://localhost:27017/epr-backend'

const testLogs = !withoutLogs && !environment
const globalUndiciAgent = !withProxy ? agent : proxy
const zapAgent = agent
const dbConnector = !environment ? database.mongo : database.stub
const apiUri = !environment ? api.local : api.env
const zapTargetApiUri = !environment ? zapTargetApi.local : zapTargetApi.env

export default {
  dbConnector,
  mongoUri,
  apiUri,
  zapTargetApiUri,
  testLogs,
  dockerLogParser,
  zap,
  zapAgent,
  undiciAgent: globalUndiciAgent
}
