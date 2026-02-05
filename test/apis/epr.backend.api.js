import { request } from 'undici'
import config from '../config/config.js'

let eprBackendUrl

export class EprBackendApi {
  constructor() {
    eprBackendUrl = config.apiUri
    this.defaultHeaders = config.apiHeaders
  }

  async get(endpoint, headers = {}) {
    const {
      statusCode,
      headers: responseHeaders,
      body
    } = await request(`${eprBackendUrl}${endpoint}`, {
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
    } = await request(`${eprBackendUrl}${endpoint}`, {
      method,
      headers: instanceHeaders,
      body: data
    })
    return { statusCode, responseHeaders, body }
  }
}

export { eprBackendUrl }
