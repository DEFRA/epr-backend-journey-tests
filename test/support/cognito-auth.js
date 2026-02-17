import { request, setGlobalDispatcher } from 'undici'
import config from '../test/config/config.js'

setGlobalDispatcher(config.undiciAgent)

class CognitoAuth {
  constructor(config = {}) {
    this.cognitoUrl = config.cognitoUrl
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.accessToken = null
  }

  async generateToken() {
    const payload = new URLSearchParams({
      // eslint-disable-next-line camelcase
      grant_type: 'client_credentials',
      // eslint-disable-next-line camelcase
      client_id: this.clientId,
      // eslint-disable-next-line camelcase
      client_secret: this.clientSecret
    })

    const { statusCode, body } = await request(this.cognitoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString()
    })

    const data = await body.json()

    if (statusCode !== 200) {
      throw new Error(
        `Cognito Auth failed (${statusCode}): ${JSON.stringify(data)}`
      )
    }

    this.accessToken = data.access_token
  }

  authHeader() {
    return { Authorization: `Bearer ${this.accessToken}` }
  }
}

export { CognitoAuth }
