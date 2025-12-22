import config from '../config/config.js'
import { request } from 'undici'

export class DefraIdStub {
  constructor(baseUrl = config.defraIdUri) {
    this.baseUrl = baseUrl
    this.defaultHeaders = config.apiHeaders
    this.processedOrgs = new Map()
    this.accessTokens = new Map()
    this.linked = new Map()
  }

  async register(payload) {
    const instanceHeaders = { ...this.defaultHeaders }
    const response = await request(
      `${this.baseUrl}/cdp-defra-id-stub/API/register`,
      {
        method: 'POST',
        headers: instanceHeaders,
        body: payload
      }
    )

    return await response.body.json()
  }

  async addRelationship(payload, userId) {
    const instanceHeaders = {
      ...this.defaultHeaders,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    const response = await request(
      `${this.baseUrl}/cdp-defra-id-stub/register/${userId}/relationship`,
      {
        method: 'POST',
        headers: instanceHeaders,
        body: payload
      }
    )
    return await response
  }

  async authorise(payload) {
    const query = Object.entries(payload)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&')

    const instanceHeaders = { ...this.defaultHeaders }
    const response = await request(
      `${this.baseUrl}/cdp-defra-id-stub/authorize?${query}`,
      {
        method: 'GET',
        headers: instanceHeaders
      }
    )

    const headers = await response.headers
    return headers.location
  }

  async generateToken(payload, userId) {
    const instanceHeaders = { ...this.defaultHeaders }
    const response = await request(`${this.baseUrl}/cdp-defra-id-stub/token`, {
      method: 'POST',
      headers: instanceHeaders,
      body: payload
    })
    const responseJson = await response.body.json()
    this.accessTokens.set(userId, responseJson.access_token)
    return responseJson
  }

  authHeader(userId) {
    if (this.accessTokens.has(userId)) {
      return { Authorization: 'Bearer ' + this.accessTokens.get(userId) }
    } else {
      return {}
    }
  }
}
