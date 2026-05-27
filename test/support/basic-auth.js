import config from '../config/config.js'

export class BasicAuth {
  async defaultBasicAuthHeader() {
    this.authorisationHeader = Buffer.from(
      `${config.basicAuth.username}:${config.basicAuth.password}`
    ).toString('base64')
  }

  async generateAuthHeader(username, password) {
    this.authorisationHeader = Buffer.from(`${username}:${password}`).toString(
      'base64'
    )
  }

  authHeader() {
    if (this.authorisationHeader) {
      return { Authorization: 'Basic ' + this.authorisationHeader }
    } else {
      return {}
    }
  }
}
