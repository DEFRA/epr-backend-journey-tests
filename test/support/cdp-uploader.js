import config from '../config/config.js'
import { request, FormData } from 'undici'
import { createReadStream, readFileSync } from 'fs'
import { Blob } from 'buffer'

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

    return await request(`${this.baseUrl}/upload-and-scan/${uploadId}`, {
      method: 'POST',
      headers: instanceHeaders,
      body: fileStream
    })
  }

  async uploadMultipleFiles(uploadId, filenames, filePathPrefix = 'data/') {
    const formData = new FormData()
    const mimeType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    for (const filename of filenames) {
      const buffer = readFileSync(filePathPrefix + filename)
      const blob = new Blob([buffer], { type: mimeType })
      formData.append('file', blob, filename)
    }

    return await request(`${this.baseUrl}/upload-and-scan/${uploadId}`, {
      method: 'POST',
      headers: { ...this.defaultHeaders },
      body: formData
    })
  }

  async status(uploadId) {
    const instanceHeaders = {
      ...this.defaultHeaders
    }
    return await request(`${this.baseUrl}/status/${uploadId}`, {
      method: 'GET',
      headers: instanceHeaders
    })
  }
}
