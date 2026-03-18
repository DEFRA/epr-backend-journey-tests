import { Then, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import { authClient, cdpUploader, eprBackendAPI } from '../support/hooks.js'
import config from '../config/config.js'
import logger from '../support/logger.js'
import {
  createOrsSpreadsheet,
  validOrsSites,
  validOrsSitesReg2,
  invalidOrsSites
} from '../support/ors-spreadsheet.js'

When(
  'I upload the generated file {string} via the CDP uploader',
  async function (filename) {
    this.response = await cdpUploader.uploadAndScan(
      this.uploadId,
      filename,
      'data/'
    )
  }
)

When(
  'I upload the following files via the CDP uploader',
  async function (dataTable) {
    const filenames = dataTable.hashes().map((row) => row.filename)
    this.response = await cdpUploader.uploadMultipleFiles(
      this.uploadId,
      filenames
    )
  }
)

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
  this.orsImportId = this.responseData.id
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
      const fileStatus = this.responseData.form?.orsUpload?.fileStatus
      if (fileStatus === 'complete') {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, config.interval))
    }

    const upload = this.responseData.form.orsUpload
    const uploadPayload = {
      form: {
        orsUpload: {
          fileId: upload.fileId,
          filename: upload.filename,
          fileStatus: upload.fileStatus,
          s3Bucket: upload.s3Bucket,
          s3Key: upload.s3Key
        }
      }
    }

    this.response = await eprBackendAPI.post(
      `/v1/overseas-sites/imports/${this.orsImportId}/upload-completed`,
      JSON.stringify(uploadPayload)
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

Then(
  'the ORS import should have {int} file results all successful',
  async function (expectedFileCount) {
    expect(this.responseData.files).to.have.lengthOf(expectedFileCount)

    for (const file of this.responseData.files) {
      // eslint-disable-next-line no-unused-expressions
      expect(file.result, `Expected result for file ${file.fileName}`).to.not.be
        .null
      expect(file.result.status).to.equal('success')
    }
  }
)

Then('the ORS import file result should have errors', async function () {
  expect(this.responseData.files).to.have.lengthOf(1)
  const fileResult = this.responseData.files[0].result
  // eslint-disable-next-line no-unused-expressions
  expect(fileResult).to.not.be.null
  expect(fileResult.status).to.equal('failure')
  expect(fileResult.errors).to.have.length.greaterThan(0)
})

const verifyOverseasSites = async (orgId, registrationId, expectedSites) => {
  const response = await eprBackendAPI.get(
    `/v1/organisations/${orgId}`,
    authClient.authHeader()
  )
  expect(response.statusCode).to.equal(200)
  const orgData = await response.body.json()

  const registration = orgData.registrations.find(
    (r) => r.id === registrationId
  )
  // eslint-disable-next-line no-unused-expressions
  expect(registration, `Expected registration ${registrationId}`).to.not.be
    .undefined
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

Then(
  'I should see the following overseas sites mapped to the registration',
  async function (dataTable) {
    await verifyOverseasSites(
      this.organisationId,
      this.registrationId,
      dataTable.hashes()
    )
  }
)

Then(
  'the registration {string} should have the following overseas sites',
  async function (regNumber, dataTable) {
    await verifyOverseasSites(
      this.organisationId,
      this.registrationIds.get(regNumber),
      dataTable.hashes()
    )
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

When('I generate the ORS test spreadsheets', async function () {
  const orgId = parseInt(this.orgResponseData.orgId)
  const regEntries = [...this.registrationIds.keys()]
  const accEntries = [...this.accreditationIds.keys()]

  const reg1Metadata = {
    packagingWasteCategory: 'Paper or board',
    orgId,
    registrationNumber: regEntries[0],
    accreditationNumber: accEntries[0]
  }

  await createOrsSpreadsheet('data/ors-valid.xlsx', {
    metadata: reg1Metadata,
    sites: validOrsSites
  })
  await createOrsSpreadsheet('data/ors-invalid.xlsx', {
    metadata: reg1Metadata,
    sites: invalidOrsSites
  })
  await createOrsSpreadsheet('data/ors-reg1-valid.xlsx', {
    metadata: reg1Metadata,
    sites: validOrsSites
  })

  if (regEntries.length > 1) {
    await createOrsSpreadsheet('data/ors-reg2-valid.xlsx', {
      metadata: {
        packagingWasteCategory: 'Paper or board',
        orgId,
        registrationNumber: regEntries[1],
        accreditationNumber: accEntries[1]
      },
      sites: validOrsSitesReg2
    })
  }
})
