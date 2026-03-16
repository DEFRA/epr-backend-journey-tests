import { Then, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import { authClient, cdpUploader, eprBackendAPI } from '../support/hooks.js'
import config from '../config/config.js'
import logger from '../support/logger.js'

When('I initiate an ORS import', async function () {
  this.orsImportPayload = {
    redirectUrl: `/v1/overseas-sites/imports`
  }
  this.response = await eprBackendAPI.post(
    '/v1/overseas-sites/imports',
    JSON.stringify(this.orsImportPayload),
    authClient.authHeader()
  )
})

Then('the ORS import initiation succeeds', async function () {
  expect(this.response.statusCode).to.equal(201)
  this.responseData = await this.response.body.json()
  this.orsImportId = this.responseData.importId
  this.uploadId = this.responseData.uploadId
})

When(
  'I submit the ORS import upload completed with the response from CDP Uploader',
  { timeout: config.pollTimeout },
  async function () {
    const timeout = config.pollTimeout
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      this.response = await cdpUploader.status(this.uploadId)

      this.responseData = await this.response.body.json()
      const fileStatus = this.responseData.form?.file?.fileStatus
      if (fileStatus === 'complete') {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, config.interval))
    }

    const uploadPayload = {
      form: {
        file: {
          fileId: this.responseData.form.file.fileId,
          filename: this.responseData.form.file.filename,
          fileStatus: this.responseData.form.file.fileStatus,
          s3Bucket: this.responseData.form.file.s3Bucket,
          s3Key: this.responseData.form.file.s3Key
        }
      }
    }

    this.response = await eprBackendAPI.post(
      `/v1/overseas-sites/imports/${this.orsImportId}/upload-completed`,
      JSON.stringify(uploadPayload),
      authClient.authHeader()
    )
  }
)

Then('I should receive an ORS import accepted response', async function () {
  expect(this.response.statusCode).to.equal(202)
})

When(
  'I check the ORS import status',
  { timeout: config.pollTimeout },
  async function () {
    const transientStatuses = ['preprocessing', 'processing']
    const timeout = config.pollTimeout
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      this.response = await eprBackendAPI.get(
        `/v1/overseas-sites/imports/${this.orsImportId}`,
        authClient.authHeader()
      )

      if (this.response.statusCode !== 200) {
        return
      }

      const responseData = await this.response.body.json()
      const currentStatus = responseData.status

      if (!transientStatuses.includes(currentStatus)) {
        logger.info(
          {
            importId: this.orsImportId,
            status: currentStatus,
            elapsedMs: Date.now() - startTime
          },
          'ORS import completed'
        )
        this.responseData = responseData
        return
      }

      await new Promise((resolve) => setTimeout(resolve, config.interval))
    }

    this.response = await eprBackendAPI.get(
      `/v1/overseas-sites/imports/${this.orsImportId}`,
      authClient.authHeader()
    )
    if (this.response.statusCode === 200) {
      this.responseData = await this.response.body.json()
    }

    logger.warn(
      {
        importId: this.orsImportId,
        timeout,
        status: this.responseData?.status,
        elapsedMs: Date.now() - startTime
      },
      'Timeout waiting for ORS import to complete'
    )
  }
)

Then(
  'the ORS import status should be {string}',
  async function (expectedStatus) {
    expect(this.response.statusCode).to.equal(200)
    expect(this.responseData.status).to.equal(expectedStatus)
  }
)

Then('the ORS import file result should be', async function (dataTable) {
  const expected = dataTable.hashes()[0]

  expect(this.responseData.files).to.have.lengthOf(1)
  const fileResult = this.responseData.files[0].result
  // eslint-disable-next-line no-unused-expressions
  expect(fileResult).to.not.be.null
  expect(fileResult.status).to.equal(expected.Status)
  expect(fileResult.sitesCreated).to.equal(parseInt(expected.SitesCreated))
})

Then('the ORS import file result should have errors', async function () {
  expect(this.responseData.files).to.have.lengthOf(1)
  const fileResult = this.responseData.files[0].result
  // eslint-disable-next-line no-unused-expressions
  expect(fileResult).to.not.be.null
  expect(fileResult.status).to.equal('failure')
  expect(fileResult.errors).to.have.length.greaterThan(0)
})

Then(
  'I should see the following overseas sites mapped to the registration',
  async function (dataTable) {
    const expectedSites = dataTable.hashes()
    const orgId = this.organisationId

    this.response = await eprBackendAPI.get(
      `/v1/organisations/${orgId}`,
      authClient.authHeader()
    )
    expect(this.response.statusCode).to.equal(200)
    const orgData = await this.response.body.json()

    const registration = orgData.registrations.find(
      (r) => r.id === this.registrationId
    )
    // eslint-disable-next-line no-unused-expressions
    expect(registration).to.not.be.undefined
    // eslint-disable-next-line no-unused-expressions
    expect(registration.overseasSites).to.not.be.undefined

    for (const expected of expectedSites) {
      const mapping = registration.overseasSites[expected.OrsId]
      // eslint-disable-next-line no-unused-expressions
      expect(
        mapping,
        `Expected overseas site mapping for ORS ID ${expected.OrsId}`
      ).to.not.be.undefined
      expect(mapping.overseasSiteId).to.be.a('string')

      // Verify the site details via the overseas sites API
      const siteResponse = await eprBackendAPI.get(
        `/v1/overseas-sites/${mapping.overseasSiteId}`,
        authClient.authHeader()
      )
      expect(siteResponse.statusCode).to.equal(200)
      const site = await siteResponse.body.json()
      expect(site.name).to.equal(expected.Name)
      expect(site.country).to.equal(expected.Country)
      expect(site.address.townOrCity).to.equal(expected.TownOrCity)
    }
  }
)

Then(
  'the registration should have exactly {int} overseas site mappings',
  async function (expectedCount) {
    const orgId = this.organisationId

    this.response = await eprBackendAPI.get(
      `/v1/organisations/${orgId}`,
      authClient.authHeader()
    )
    expect(this.response.statusCode).to.equal(200)
    const orgData = await this.response.body.json()

    const registration = orgData.registrations.find(
      (r) => r.id === this.registrationId
    )
    // eslint-disable-next-line no-unused-expressions
    expect(registration).to.not.be.undefined
    // eslint-disable-next-line no-unused-expressions
    expect(registration.overseasSites).to.not.be.undefined

    const mappingCount = Object.keys(registration.overseasSites).length
    expect(mappingCount).to.equal(
      expectedCount,
      `Expected ${expectedCount} overseas site mappings but found ${mappingCount}`
    )
  }
)
