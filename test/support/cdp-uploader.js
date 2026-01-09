import config from '../config/config.js'
import { request } from 'undici'
import { createReadStream } from 'fs'

export class CDPUploader {
  constructor(baseUrl = config.cdpUploaderUri) {
    this.baseUrl = baseUrl
    this.defaultHeaders = config.apiHeaders
  }

  async uploadAndScan(uploadId, filename, filePathPrefix = 'resources/') {
    const instanceHeaders = {
      ...this.defaultHeaders,
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'x-filename': filename
    }

    const fileStream = createReadStream(filePathPrefix + filename)

    const response = await request(
      `${this.baseUrl}/upload-and-scan/${uploadId}`,
      {
        method: 'POST',
        headers: instanceHeaders,
        body: fileStream
      }
    )

    return await response
  }

  async status(uploadId) {
    const instanceHeaders = {
      ...this.defaultHeaders
    }
    const response = await request(`${this.baseUrl}/status/${uploadId}`, {
      method: 'GET',
      headers: instanceHeaders
    })
    return await response
  }
}
