import { request } from 'undici'
import config from '../config/config.js'

let baseUrl

export class BaseAPI {
  constructor() {
    baseUrl = config.apiUri
    this.defaultHeaders = config.apiHeaders
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
    return await this.#call('POST', endpoint, data, headers)
  }

  async put(endpoint, data, headers = {}) {
    return await this.#call('PUT', endpoint, data, headers)
  }

  async patch(endpoint, data, headers = {}) {
    return await this.#call('PATCH', endpoint, data, headers)
  }

  async #call(method, endpoint, data, headers) {
    const instanceHeaders = { ...this.defaultHeaders, ...headers }
    const {
      statusCode,
      headers: responseHeaders,
      body
    } = await request(`${baseUrl}${endpoint}`, {
      method,
      headers: instanceHeaders,
      body: data
    })
    return { statusCode, responseHeaders, body }
  }
}

export { baseUrl }
