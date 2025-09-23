import { MongoConnector, StubConnector } from '../support/db.js'
import { Agent, ProxyAgent } from 'undici'

const api = {
  local: 'http://localhost:3001',
  env: `https://epr-backend.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
}

const proxy = new ProxyAgent({
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
  uri: 'http://localhost:8080',
  key: 'zap-api-key'
}

const dockerLogParser = {
  containerName: 'epr-backend-journey-tests-epr-backend-1',
  fallbackContainerName: 'epr-backend-epr-backend-1'
}

const mongoUri = 'mongodb://localhost:27017/epr-backend'

const testLogs = !process.env.WITHOUT_LOGS
const undiciAgent = !process.env.WITH_PROXY ? agent : proxy
const dbConnector = !process.env.ENVIRONMENT ? database.mongo : database.stub
const apiUri = !process.env.ENVIRONMENT ? api.local : api.env

export default {
  dbConnector,
  mongoUri,
  apiUri,
  testLogs,
  dockerLogParser,
  zap,
  undiciAgent
}
