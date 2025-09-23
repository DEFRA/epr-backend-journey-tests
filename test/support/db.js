import { MongoClient } from 'mongodb'
import config from '../config/config.js'

export class MongoConnector {
  constructor() {
    this.client = null
    this.db = null
  }

  async connect() {
    const uri = config.mongoUri
    this.client = new MongoClient(uri)
    await this.client.connect()
    this.db = this.client.db()
    return this.db
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
    }
  }
}

export class StubConnector {
  async connect() {}
  async disconnect() {}
}
