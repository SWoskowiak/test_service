const db = require('@arangodb').db
const medicalCollection = db._collection('medical_ids')

class MedicalID {
  static fetchByUser (userID, done) {
    return done(null, 321)
  }

  // Save a new medical ID and relate it to the user
  static create (userID, params, done) {
    return Promise.resolve(medicalCollection.save(params)).then((id) => {
      console.log(`New ID: ${id}`)
      done(null, id)
    })
  }
}

module.exports = MedicalID
