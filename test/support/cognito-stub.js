import { request } from 'undici'

class CognitoStub {
  constructor(config = {}) {
    this.url = config.url
    this.clientId = config.clientId
    this.username = config.username
    this.password = config.password
    this.accessToken = null
  }

  async generateToken() {
    const { statusCode, body } = await request(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: this.username,
          PASSWORD: this.password
        }
      })
    })

    const data = await body.json()

    if (statusCode !== 200) {
      throw new Error(
        `Cognito InitiateAuth failed (${statusCode}): ${JSON.stringify(data)}`
      )
    }

    this.accessToken = data.AuthenticationResult.AccessToken
  }

  authHeader() {
    return { Authorization: `Bearer ${this.accessToken}` }
  }
}

export { CognitoStub }
