import { MongoClient } from 'mongodb'

export class MongoConnector {
  constructor() {
    this.client = null
    this.db = null
  }

  async connect() {
    const uri = 'mongodb://localhost:27017/epr-backend'
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
