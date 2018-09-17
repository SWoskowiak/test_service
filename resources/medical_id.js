const db = require('@arangodb').db
const medicalCollection = db._collection('medical_ids')
const moment = require('moment')

class MedicalID {
  static validate (userID, params) {

  }

  static fetch (userID, callback) {
    return callback(null, 321)
  }

  static create (userID, params, callback) {
    return Promise.resolve(medicalCollection.save(params)).then((id) => {
      console.log(`New ID: ${id}`)
      callback(null, id)
    })
  }
}

module.exports = MedicalID
