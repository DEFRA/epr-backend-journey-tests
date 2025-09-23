import { request } from 'undici'
import config from '../config/config.js'

let baseUrl

export class BaseAPI {
  constructor() {
    baseUrl = config.apiUri
    this.defaultHeaders = {}
  }

  async get(endpoint, headers = {}) {
    const {
      statusCode,
      headers: responseHeaders,
      body
    } = await request(`${baseUrl}${endpoint}`, {
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
    } = await request(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: instanceHeaders,
      body: data
    })
    return { statusCode, responseHeaders, body }
  }
}

export { baseUrl }
