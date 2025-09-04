import { request } from 'undici'

export class BaseAPI {
  constructor() {
    if (process.env.ENVIRONMENT) {
      if (process.env.ENVIRONMENT === 'github') {
        this.baseUrl = 'http://0.0.0.0:3001'
      } else {
        this.baseUrl = `https://epr-backend.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
      }
    } else {
      this.baseUrl = 'http://localhost:3001'
    }
    this.defaultHeaders = {}
  }

  async get(endpoint, headers = {}) {
    const {
      statusCode,
      headers: responseHeaders,
      body
    } = await request(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...headers }
    })
    return { statusCode, responseHeaders, body }
  }

  async post(endpoint, data, headers = {}) {
    const instanceHeaders = { ...this.defaultHeaders, ...headers }
    const {
      statusCode,
      headers: responseHeaders,
      body
    } = await request(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: instanceHeaders,
      body: data
    })
    return { statusCode, responseHeaders, body }
  }
}
