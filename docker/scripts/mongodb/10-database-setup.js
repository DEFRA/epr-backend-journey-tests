/**
 * Mongodb script for inserting test data into the docker-compose mongo instance
 */

db = db.getSiblingDB('test')

db.test.insertOne({ test: 'data' })
