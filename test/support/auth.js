import config from '../config/config.js'
import { request } from 'undici'

export class AuthClient {
  constructor(baseUrl = config.auth.uri) {
    this.baseUrl = baseUrl
    this.defaultHeaders = config.apiHeaders
  }

  async signToken(clientId, username) {
    const instanceHeaders = { ...this.defaultHeaders }
    const payload = {
      clientId,
      username
    }
    const response = await request(`${this.baseUrl}/sign`, {
      method: 'POST',
      headers: instanceHeaders,
      body: JSON.stringify(payload)
    })
    const responseJson = await response.body.json()
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
