import { BeforeAll, AfterAll, After } from '@cucumber/cucumber'
import { setGlobalDispatcher, Agent } from 'undici'
import fs from 'node:fs'

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

After(async function (scenario) {
  if (scenario.result.status === 'FAILED') {
    const failureMessage = `${new Date().toISOString()} - FAILED: ${scenario.pickle.name} - ${scenario.result.message}\n`
    await fs.appendFileSync('FAILED', failureMessage)
  }
})
