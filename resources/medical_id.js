const db = require('@arangodb').db
const medical_id_collection = db._collection('medical_ids')
const moment = require('moment')

class MedicalID {
  static validate (userID, params) {

  }

  static fetch (userID, callback) {
    return callback(null, 456)
  }

  static create (userID, params, callback) {
    medical_id_collection.save(params)
      .then((results) => {
        console.log(results)
        callback(null, 'working')
      })
  }
}

module.exports = MedicalID
