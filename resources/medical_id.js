const db = require('@arangodb').db
const aql = require('@arangodb').aql
const collection = db._collection('medical_ids')
const edgeCollection = db._collection('medical_id_of')

class MedicalID {
  static fetchByUserID (userID, done) {
    let user = `users/${userID}`
    // Get all of a user's medical_id's
    let results = db._query(aql`
      WITH users, medical_ids
      FOR vertex IN 1..1 INBOUND ${user} medical_id_of
      RETURN vertex
    `).toArray()[0]

    if (done) {
      return done(null, results)
    } else {
      return results
    }
  }

  // Save a new medical ID and relate it to the user
  static create (userID, params, done) {
    // Add some helpful auditing times
    let now = new Date().toISOString()
    params.create_time = now
    params.update_time = now

    // Please note: FOXX services run in a node-like environment, async is not supported in here, it operates entirely synchronously probably for concurenncy purposes
    // See: https://docs.arangodb.com/3.3/Manual/Foxx/Dependencies.html#compatibility-caveats for some detail
    let newID = collection.save(params)._key
    edgeCollection.save({
      create_time: now,
      _from: `medical_ids/${newID}`,
      _to: `users/${userID}`
    })

    done(null, newID)
  }
}

module.exports = MedicalID
