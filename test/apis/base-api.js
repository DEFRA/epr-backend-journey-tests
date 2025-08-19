import { request } from 'undici'

export class BaseAPI {
  constructor() {
    this.baseUrl = process.env.ENVIRONMENT
      ? `https://epr-backend.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
      : 'http://localhost:3001'
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
