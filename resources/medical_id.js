const db = require('@arangodb').db
const medical_id_collection = db._collection('medical_ids')

class MedicalID {
  static fetch (userID, callback) {
    return callback(null, 456)
  }
}

module.exports = MedicalID
