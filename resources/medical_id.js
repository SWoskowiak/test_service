const db = require('@arangodb').db
const medicalIDCollection = db._collection('medical_ids')

class MedicalID {
  static fetchByUser (userID, done) {
    return done(null, 321)
  }

  // Save a new medical ID and relate it to the user
  static create (userID, params, done) {
    // Please note: FOXX services run in a node-like environment, async is not properly supported in here
    // See: https://docs.arangodb.com/3.3/Manual/Foxx/Dependencies.html#compatibility-caveats
    let newID = medicalIDCollection.save(params)

    done(null, newID)
    // return Promise.resolve(medicalIDCollection.save(params)).then((id) => {
    //   console.log(`New ID: ${id}`)
    //   done(null, id)
    // })
  }
}

module.exports = MedicalID
