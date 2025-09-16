import { request } from 'undici'

const ZAP_API = 'http://localhost:8080'
const ZAP_KEY = 'zap-api-key'

export class ZAPClient {
  constructor(baseUrl = ZAP_API, apiKey = ZAP_KEY) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  async zapRequest(endpoint, params = {}, urlPrefix = 'JSON') {
    const url = new URL(`/${urlPrefix}/${endpoint}`, this.baseUrl)
    url.searchParams.append('apikey', this.apiKey)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const { statusCode, body } = await request(url.toString())
    if (statusCode !== 200) {
      throw new Error(`ZAP API error: ${statusCode}`)
    }
    return JSON.parse(await body.text())
  }

  async runAction(action, url) {
    const response = await this.zapRequest(`${action}/action/scan`, { url })
    const scanId = response.scan
    let attempts = 0
    let status = await this.zapRequest(`${action}/view/status`, { scanId })
    let progress = parseInt(status.status)
    while (progress < 100 && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      status = await this.zapRequest(`${action}/view/status`, { scanId })
      progress = parseInt(status.status)
      attempts++
    }

    return scanId
  }

  async runSpider(url) {
    return this.runAction('spider', url)
  }

  async runActiveScan(url) {
    return this.runAction('ascan', url)
  }

  async generateReport() {
    return await this.zapRequest('core/other/jsonreport', {}, 'OTHER')
  }
}
