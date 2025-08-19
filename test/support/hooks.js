import { BeforeAll, AfterAll } from '@cucumber/cucumber'
import { setGlobalDispatcher, Agent } from 'undici'

let agent

BeforeAll(async function () {
  agent = new Agent({
    connections: 10,
    pipelining: 0,
    headersTimeout: 30000,
    bodyTimeout: 30000
  })
  setGlobalDispatcher(agent)
})

AfterAll(async function () {
  await agent.close()
})
