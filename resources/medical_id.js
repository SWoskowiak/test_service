const db = require('@arangodb').db
const medical_id_collection = db._collection('medical_ids')

class MedicalID {
  static async fetch (userID) {
    return 456
  }
}

module.exports = MedicalID
