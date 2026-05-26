import config from '../config/config.js'
import { request } from 'undici'

export class AuthClient {
  constructor(baseUrl = config.authUri) {
    this.baseUrl = baseUrl
    this.defaultHeaders = config.apiHeaders
  }

  async generateToken(payload, suffix) {
    const instanceHeaders = { ...this.defaultHeaders }
    const response = await request(`${this.baseUrl}${suffix}`, {
      method: 'POST',
      headers: instanceHeaders,
      body: payload
    })
    /**
     * @typedef {Object} AuthResponse
     * @property {string} access_token
     * @property {string} token_type
     * @property {number} expires_in
     */
    const responseJson = /** @type {AuthResponse} */ (
      await response.body.json()
    )
    this.accessToken = responseJson.access_token
  }

  authHeader() {
    if (this.accessToken) {
      return { Authorization: 'Bearer ' + this.accessToken }
    } else {
      return {}
    }
  }
}
