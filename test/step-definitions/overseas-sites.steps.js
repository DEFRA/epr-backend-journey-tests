import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from 'chai'
import {
  authClient,
  cdpUploader,
  dbClient,
  eprBackendAPI,
  interpolator
} from '../support/hooks.js'
import config from '../config/config.js'
import logger from '../support/logger.js'
import {
  createOrsSpreadsheet,
  validOrsSites,
  validOrsSitesReg2,
  invalidOrsSites
} from '../support/ors-spreadsheet.js'

const adminListOrsSites = [
  {
    orsId: 1,
    country: 'Norway',
    name: 'Nordic Paper Recovery One',
    line1: '11 Fjord Lane',
    line2: 'Unit 1',
    townOrCity: 'Oslo',
    stateOrRegion: 'Oslo',
    postcode: '0150',
    coordinates: '59.9139,10.7522',
    validFrom: '2025-03-01'
  },
  {
    orsId: 2,
    country: 'Sweden',
    name: 'Nordic Paper Recovery Two',
    line1: '22 Harbor Street',
    townOrCity: 'Stockholm',
    stateOrRegion: 'Stockholm County',
    postcode: '11122',
    coordinates: '59.3293,18.0686',
    validFrom: '2025-03-01'
  },
  {
    orsId: 3,
    country: 'Denmark',
    name: 'Nordic Paper Recovery Three',
    line1: '33 Canal Road',
    line2: 'Dock C',
    townOrCity: 'Copenhagen',
    stateOrRegion: 'Capital Region',
    postcode: '1050',
    coordinates: '55.6761,12.5683',
    validFrom: '2025-03-01'
  }
]

Given(
  'there are no existing overseas sites in the admin list',
  async function () {
    await dbClient.collection('overseas-sites').deleteMany({})
  }
)

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
  'I upload ORS file {string} via the CDP uploader',
  async function (filename) {
    this.response = await cdpUploader.uploadMultipartForm(
      this.uploadId,
      'orsUpload',
      [filename],
      'data/'
    )
  }
)

When('I upload ORS files via the CDP uploader', async function (dataTable) {
  const filenames = dataTable.hashes().map((row) => row.filename)
  this.response = await cdpUploader.uploadMultipartForm(
    this.uploadId,
    'orsUpload',
    filenames,
    'data/'
  )
})

const pollUntilScanned = async (uploadId) => {
  const timeout = config.pollTimeout
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const response = await cdpUploader.status(uploadId)
    const data = await response.body.json()
    const fileStatus = data.form?.orsUpload?.fileStatus

    if (fileStatus === 'complete' || fileStatus === 'rejected') {
      return data.form.orsUpload
    }

    await new Promise((resolve) => setTimeout(resolve, config.interval))
  }

  throw new Error(`Timeout waiting for CDP upload ${uploadId} to complete`)
}

const toOrsUploadField = (cdpFile) => ({
  fileId: cdpFile.fileId,
  filename: cdpFile.filename,
  fileStatus: cdpFile.fileStatus,
  s3Bucket: cdpFile.s3Bucket,
  s3Key: cdpFile.s3Key
})

When(
  'I submit the ORS import upload completed with the response from CDP Uploader',
  { timeout: config.pollTimeout },
  async function () {
    const scannedFile = await pollUntilScanned(this.uploadId)

    this.response = await eprBackendAPI.post(
      `/v1/overseas-sites/imports/${this.orsImportId}/upload-completed`,
      JSON.stringify({
        form: { orsUpload: toOrsUploadField(scannedFile) }
      })
    )
  }
)

When(
  'I upload and scan the following ORS files',
  { timeout: config.pollTimeout },
  async function (dataTable) {
    const filenames = dataTable.hashes().map((row) => row.filename)
    this.scannedOrsFiles = []

    for (const filename of filenames) {
      const initResponse = await eprBackendAPI.post(
        '/v1/overseas-sites/imports',
        JSON.stringify({ redirectUrl: '/v1/overseas-sites/imports' }),
        authClient.authHeader()
      )
      const { uploadId } = await initResponse.body.json()

      await cdpUploader.uploadMultipartForm(
        uploadId,
        'orsUpload',
        [filename],
        'data/'
      )
      const scannedFile = await pollUntilScanned(uploadId)
      this.scannedOrsFiles.push(scannedFile)
    }
  }
)

When('I submit the ORS multi-file upload completed', async function () {
  this.response = await eprBackendAPI.post(
    `/v1/overseas-sites/imports/${this.orsImportId}/upload-completed`,
    JSON.stringify({
      form: { orsUpload: this.scannedOrsFiles.map(toOrsUploadField) }
    })
  )
})

Then('I should receive an ORS import accepted response', async function () {
  expect(this.response.statusCode).to.equal(202)
})

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

  const successfulFile = this.responseData.files.find(
    (f) => f.result?.status === expected.Status
  )
  // eslint-disable-next-line no-unused-expressions
  expect(successfulFile, `Expected a file with status ${expected.Status}`).to
    .not.be.undefined
  expect(successfulFile.result.sitesCreated).to.equal(
    parseInt(expected.SitesCreated)
  )
})

Then(
  'the ORS import should have {int} file results all successful',
  async function (expectedFileCount) {
    const successfulFiles = this.responseData.files.filter(
      (f) => f.result?.status === 'success'
    )
    expect(successfulFiles).to.have.lengthOf(expectedFileCount)
  }
)

Then('the ORS import file result should have errors', async function () {
  const failedFile = this.responseData.files.find(
    (f) => f.result?.status === 'failure'
  )
  // eslint-disable-next-line no-unused-expressions
  expect(failedFile, 'Expected a file with errors').to.not.be.undefined
  expect(failedFile.result.errors).to.have.length.greaterThan(0)
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

When('I generate the admin ORS test spreadsheet', async function () {
  const orgId = parseInt(this.orgResponseData.orgId)
  const regEntries = [...this.registrationIds.keys()]
  const accEntries = [...this.accreditationIds.keys()]

  await createOrsSpreadsheet('data/ors-admin-list.xlsx', {
    metadata: {
      packagingWasteCategory: 'Paper or board',
      orgId,
      registrationNumber: regEntries[0],
      accreditationNumber: accEntries[0]
    },
    sites: adminListOrsSites
  })
})

When('I request the admin overseas sites list', async function () {
  this.adminOverseasSitesListBody = undefined
  this.response = await eprBackendAPI.get(
    '/v1/admin/overseas-sites',
    authClient.authHeader()
  )
})

When(
  'I request the admin overseas sites list with page {int} and page size {int}',
  async function (page, pageSize) {
    this.adminOverseasSitesListBody = undefined
    this.response = await eprBackendAPI.get(
      `/v1/admin/overseas-sites?page=${page}&pageSize=${pageSize}`,
      authClient.authHeader()
    )
  }
)

When(
  'I request the admin overseas sites list with all records',
  async function () {
    this.adminOverseasSitesListBody = undefined
    this.response = await eprBackendAPI.get(
      '/v1/admin/overseas-sites?all=true',
      authClient.authHeader()
    )
  }
)

When(
  'I request the admin overseas sites list without authentication',
  async function () {
    this.adminOverseasSitesListBody = undefined
    this.response = await eprBackendAPI.get('/v1/admin/overseas-sites')
  }
)

const getAdminOverseasSitesListBody = async (world) => {
  if (!world.adminOverseasSitesListBody) {
    world.adminOverseasSitesListBody = await world.response.body.json()
  }

  return world.adminOverseasSitesListBody
}

Then(
  'the admin overseas sites list status should be {int}',
  async function (statusCode) {
    expect(this.response.statusCode).to.equal(statusCode)
  }
)

Then(
  'the admin overseas sites list should include',
  async function (dataTable) {
    expect(this.response.statusCode).to.equal(200)

    const responseBody = await getAdminOverseasSitesListBody(this)
    const responseRows = Array.isArray(responseBody)
      ? responseBody
      : responseBody.rows
    const expectedRows = dataTable.hashes().map((row) => {
      const interpolatedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          interpolator.interpolate(this, value)
        ])
      )

      return {
        ...interpolatedRow,
        ...(Object.hasOwn(interpolatedRow, 'addressLine2')
          ? {
              addressLine2:
                interpolatedRow.addressLine2 === ''
                  ? null
                  : interpolatedRow.addressLine2
            }
          : {})
      }
    })

    const resolveRegistrationId = (row) => {
      const registrationNumber = row.registrationNumber
      if (registrationNumber && this.registrationIds?.has(registrationNumber)) {
        return String(this.registrationIds.get(registrationNumber))
      }

      if (row.registrationId) {
        return String(row.registrationId)
      }

      if (this.registrationId) {
        return String(this.registrationId)
      }

      return null
    }

    const toCompositeKey = (row) =>
      `${String(row.orsId)}::${resolveRegistrationId(row) ?? ''}`

    const responseRowsByCompositeKey = new Map(
      responseRows.map((row) => [toCompositeKey(row), row])
    )

    for (const expectedRow of expectedRows) {
      const responseRow = responseRowsByCompositeKey.get(
        toCompositeKey(expectedRow)
      )

      expect(
        responseRow,
        `Missing row for ORS ID ${expectedRow.orsId} and registration ID ${resolveRegistrationId(expectedRow)}`
      ).to.not.equal(undefined)

      for (const [key, expectedValue] of Object.entries(expectedRow)) {
        if (expectedValue === '{{any}}') {
          expect(responseRow[key], `${key} should be populated`).to.not.equal(
            null
          )
          expect(
            String(responseRow[key]).trim(),
            `${key} should be populated`
          ).to.not.equal('')
          continue
        }

        expect(
          String(responseRow[key]),
          `Mismatch for ${key} on ORS ${expectedRow.orsId}`
        ).to.equal(String(expectedValue))
      }
    }
  }
)

Then(
  'the admin overseas sites pagination should be page {int} of {int} with {int} total items',
  async function (page, totalPages, totalItems) {
    expect(this.response.statusCode).to.equal(200)

    const responseBody = await getAdminOverseasSitesListBody(this)
    expect(responseBody.pagination).to.deep.equal({
      page,
      pageSize: 2,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    })
  }
)

Then(
  'the admin overseas sites pagination should be page {int} of {int} with page size {int} and {int} total items',
  async function (page, totalPages, pageSize, totalItems) {
    expect(this.response.statusCode).to.equal(200)

    const responseBody = await getAdminOverseasSitesListBody(this)
    expect(responseBody.pagination).to.deep.equal({
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    })
  }
)
