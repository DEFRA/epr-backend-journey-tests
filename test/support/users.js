import { randomUUID } from 'crypto'

class Users {
  async userPayload(email) {
    return {
      userId: randomUUID(),
      email,
      firstName: 'Test',
      lastName: 'User',
      loa: '1',
      aal: '1',
      enrolmentCount: 1,
      enrolmentRequestCount: 1
    }
  }

  async userParams(userId) {
    return new URLSearchParams({
      csrfToken: randomUUID(),
      userId,
      relationshipId: 'relId',
      organisationId: randomUUID(),
      organisationName: 'ACME ltd',
      relationshipRole: 'role',
      roleName: 'User',
      roleStatus: 'Status',
      // eslint-disable-next-line camelcase
      redirect_uri: 'http://localhost:3000/'
    })
  }

  async authorisationPayload(email) {
    return {
      user: email,
      // eslint-disable-next-line camelcase
      client_id: '63983fc2-cfff-45bb-8ec2-959e21062b9a',
      // eslint-disable-next-line camelcase
      response_type: 'code',
      // eslint-disable-next-line camelcase
      redirect_uri: 'http://0.0.0.0:3001/health',
      state: 'state',
      scope: 'email'
    }
  }

  async tokenPayload(sessionId) {
    return {
      // eslint-disable-next-line camelcase
      client_id: '63983fc2-cfff-45bb-8ec2-959e21062b9a',
      // eslint-disable-next-line camelcase
      client_secret: 'test_value',
      // eslint-disable-next-line camelcase
      grant_type: 'authorization_code',
      code: `${sessionId}`
    }
  }
}

export default Users
