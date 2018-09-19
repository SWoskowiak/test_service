const db = require('@arangodb').db
const aql = require('@arangodb').aql
const collection = db._collection('medical_ids')
const edgeCollection = db._collection('medical_id_of')
const User = require('./user')

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

  // Please note: FOXX services run in a node-like environment, async is not supported in here, it operates entirely synchronously probably for concurenncy purposes
  // See: https://docs.arangodb.com/3.3/Manual/Foxx/Dependencies.html#compatibility-caveats for some detail
  // Save a new medical ID and relate it to the user
  static createOrUpdate (userID, params, done) {
    // Ensure User exists
    const user = User.fetchById(userID)
    if (!user) {
      return done(new Error(`No user found with ID: ${userID}`))
    }
    // Check if we have any medical id's stored already
    const existingMedicalIDs = MedicalID.fetchByUserID(userID)
    if (existingMedicalIDs.length) {
      // Check if it matches the state we are trying to save currently
      let existingID = existingMedicalIDs.filter((medID) => {
        if (medID) {
          return medID.state === params.state
        }
      })[0]

      if (existingID) {
        // Delegate to update()
        MedicalID.update(userID, existingID, params, done)
      } else {
        // User has other ID's but not for this state
        MedicalID.create(userID, params, done)
      }
    } else {
      // Delegate to create()
      MedicalID.create(userID, params, done)
    }
  }

  static update (userID, currentParams, params, done) {
    let now = new Date().toISOString()
    params.update_time = now

    let updateParams = Object.assign(currentParams, params)
    console.log('UPDATING')
    db._query(aql`
      FOR medical_id IN medical_ids
        FILTER medical_id._id == ${currentParams._id}
        UPDATE medical_id WITH ${updateParams} IN medical_ids
    `)

    done()
  }

  static create (userID, params, done) {
    // Add some helpful auditing times
    let now = new Date().toISOString()
    params.create_time = now
    params.update_time = now

    let newID = collection.save(params)._key
    edgeCollection.save({
      _from: `medical_ids/${newID}`,
      _to: `users/${userID}`
    })

    done(null, true) // Indicate we created a new resource
  }

  static delete (userID, state, done) {
    // Check if we have any medical id's stored already
    const existingStateIDs = MedicalID.fetchByUserID(userID)
    if (existingStateIDs.length) {
      // Check if it matches the state we are trying to save currently
      let existingID = existingStateIDs.filter((stateID) => {
        if (stateID) {
          return stateID.state === state
        }
      })[0]

      if (existingID) {
        // Delete connecting edge
        db._query(aql`
          FOR edge IN medical_id_of
            FILTER edge._from == ${existingID._id}
            REMOVE edge IN medical_id_of
        `)
        // Delete medical id entry
        db._query(aql`
          FOR medical_id IN medical_ids
            FILTER medical_id._id == ${existingID._id}
            REMOVE medical_id IN medical_ids
        `)

        done(null, true)
      } else {
        // Nothing was deleted
        done()
      }
    }
  }
}

module.exports = MedicalID
