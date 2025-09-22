import { MongoConnector, StubConnector } from '../support/db.js'
import { Agent, ProxyAgent } from 'undici'

export default {
  database: {
    connector: process.env.ENVIRONMENT
      ? new StubConnector()
      : new MongoConnector()
  },
  api: {
    baseUrl: process.env.ENVIRONMENT
      ? `https://epr-backend.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
      : 'http://localhost:3001'
  },
  undici: {
    agent: !process.env.WITH_PROXY
      ? new Agent({
          connections: 10,
          pipelining: 0,
          headersTimeout: 30000,
          bodyTimeout: 30000
        })
      : new ProxyAgent({
          uri: 'http://localhost:7777',
          proxyTunnel: false
        })
  },
  dockerLogParser: {
    fallbackContainerName: 'epr-backend-epr-backend-1'
  }
}
