const db = require('@arangodb').db
const medicalCollection = db._collection('medical_ids')
const moment = require('moment')

class MedicalID {
  static validate (userID, params) {

  }

  static async fetch (userID) {
    return 123
  }

  static async create (userID, params) {
    return medicalCollection.save(params)
  }
}

module.exports = MedicalID
