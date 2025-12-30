import { request } from 'undici'
import config from '../config/config.js'

export class ZAPClient {
  constructor(baseUrl = config.zap.uri, apiKey = config.zap.key) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
    this.scanners = []
    this.partialScanActive = false
    this.fullScanActive = false
    // this.getScanners()
  }

  async getScanners() {
    const scannerList = await this.zapRequest('ascan/view/scanners')
    this.scanners = scannerList.scanners.map((scanner) => ({
      id: scanner.id,
      name: scanner.name
    }))
  }

  async zapRequest(endpoint, params = {}, urlPrefix = 'JSON') {
    const url = new URL(`/${urlPrefix}/${endpoint}`, this.baseUrl)
    url.searchParams.append('apikey', this.apiKey)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const { statusCode, body } = await request(url.toString(), {
      dispatcher: config.zapAgent
    })
    if (statusCode !== 200) {
      throw new Error(`ZAP API error: ${statusCode}`)
    }
    return JSON.parse(await body.text())
  }

  async runAction(action, params) {
    const response = await this.zapRequest(`${action}/action/scan`, params)
    const scanId = response.scan
    let attempts = 0
    let status = await this.zapRequest(`${action}/view/status`, { scanId })
    let progress = parseInt(status.status)
    while (progress < 100 && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      status = await this.zapRequest(`${action}/view/status`, { scanId })
      progress = parseInt(status.status)
      attempts++
    }

    return scanId
  }

  async runSpider(params) {
    return this.runAction('spider', params)
  }

  async runPartialActiveScan(params) {
    if (!this.partialScanActive) {
      // Refer to zap-scan-rules.txt in the resources folder for more scanner rules
      const scannersToEnable = [
        'Buffer Overflow',
        'Format String Error',
        'CRLF Injection',
        'Cross Site Scripting (Reflected)',
        'Cross Site Scripting (Persistent)',
        'Cross Site Scripting (Persistent) - Prime',
        'Cross Site Scripting (Persistent) - Spider',
        'External Redirect',
        'GET for POST',
        'Heartbleed OpenSSL Vulnerability',
        'XPath Injection'
      ]
      const scannerIds = this.scanners
        .filter((item) => scannersToEnable.includes(item.name))
        .map((item) => item.id)
        .join(',')
      await this.zapRequest('ascan/action/disableAllScanners')
      await this.zapRequest('ascan/action/enableScanners', {
        ids: scannerIds
      })
    }
    this.partialScanActive = true
    this.fullScanActive = false
    return this.runActiveScan(params)
  }

  async runFullActiveScan(params) {
    if (!this.fullScanActive) {
      await this.zapRequest('ascan/action/enableAllScanners')
    }
    this.partialScanActive = false
    this.fullScanActive = true
    return this.runActiveScan(params)
  }

  async runActiveScan(params) {
    params.recurse = false
    return this.runAction('ascan', params)
  }

  async generateReport() {
    return await this.zapRequest('core/other/jsonreport', {}, 'OTHER')
  }
}
