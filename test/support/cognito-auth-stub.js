import { createSigner } from 'fast-jwt'

class CognitoAuthStub {
  constructor(config = {}) {
    this.userPoolId = config.userPoolId || 'us-east-1_TESTSTUB'
    this.clientId = config.clientId || 'test-client-id'
    this.region = config.region || 'us-east-1'

    this.signer = createSigner({
      key: 'test-secret-key',
      algorithm: 'HS256',
      expiresIn: '1h'
    })
  }

  generateToken(claims = {}) {
    const now = Math.floor(Date.now() / 1000)

    return this.signer({
      sub: claims.sub || 'test-user-123',
      'cognito:username': claims.username || 'testuser',
      email: claims.email || 'test@example.com',
      // eslint-disable-next-line camelcase
      email_verified: true,
      iss: `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`,
      aud: this.clientId,
      // eslint-disable-next-line camelcase
      client_id: this.clientId,
      // eslint-disable-next-line camelcase
      token_use: claims.token_use || 'id',
      // eslint-disable-next-line camelcase
      auth_time: now,
      iat: now,
      exp: now + 3600,
      ...claims
    })
  }

  authHeader(claims) {
    const token = this.generateToken(claims)
    return { Authorization: `Bearer ${token}` }
  }

  // Stub verifier
  async verify(token) {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())

    // Check client ID
    if (payload.aud !== this.clientId) {
      throw new Error('Token client ID mismatch')
    }

    return payload
  }
}

export { CognitoAuthStub }
