import { randomUUID } from 'crypto'

const reprocessorInputAndExporterUserId = '86a7607c-a1e7-41e5-a0b6-a41680d05a2a'
const reprocessorOutputUserId = '75b7607c-b1f2-12c3-b198-ab358075892b'

class Users {
  reprocessorInputAndExporterUser = {
    userId: reprocessorInputAndExporterUserId,
    email: 'alice.smith@ecorecycle.com',
    firstName: 'Alice',
    lastName: 'Smith',
    loa: '1',
    aal: '1',
    enrolmentCount: 1,
    enrolmentRequestCount: 1
  }

  reprocessorInputAndExporterUserParams = new URLSearchParams({
    csrfToken: randomUUID(),
    userId: reprocessorInputAndExporterUserId,
    relationshipId: 'relId',
    organisationId: '2dee1e31-5ac6-4bc4-8fe0-0820f710c2b1',
    organisationName: 'ACME ltd',
    relationshipRole: 'role',
    roleName: 'User',
    roleStatus: 'Status',
    // eslint-disable-next-line camelcase
    redirect_uri: 'http://localhost:3000/'
  })

  reprocessorOutputUserParams = new URLSearchParams({
    csrfToken: randomUUID(),
    userId: reprocessorOutputUserId,
    relationshipId: 'relId',
    organisationId: 'b1aa1277-4bde-312c-9da1-9876a235c2f3',
    organisationName: 'Green Future Trust',
    relationshipRole: 'role',
    roleName: 'User',
    roleStatus: 'Status',
    // eslint-disable-next-line camelcase
    redirect_uri: 'http://localhost:3000/'
  })

  reprocessorOutputUser = {
    userId: reprocessorOutputUserId,
    email: 'eve.black@charity.org',
    firstName: 'Eve',
    lastName: 'Black',
    loa: '1',
    aal: '1',
    enrolmentCount: 1,
    enrolmentRequestCount: 1
  }

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
