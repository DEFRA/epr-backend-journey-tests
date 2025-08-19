import { expect } from '@wdio/globals'

import HomePage from 'page-objects/home.page'

describe('Health page', () => {
  it('Should display success', async () => {
    await HomePage.openLink('health')
    const elem = await $('pre')
    await expect(elem).toHaveText(expect.stringContaining('success'))
  })
})
