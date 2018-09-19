const db = require('@arangodb').db
const aql = require('@arangodb').aql
const collection = db._collection('state_ids')
const edgeCollection = db._collection('state_id_of')
const User = require('./user')

class StateID {
  static fetchByUserID (userID, done) {
    let user = `users/${userID}`
    // Get all of a user's state_id's
    let results = db._query(aql`
      WITH users, state_ids
      FOR vertex IN 1..1 INBOUND ${user} state_id_of
      RETURN vertex
    `).toArray()

    if (done) {
      return done(null, results)
    } else {
      return results
    }
  }

  // Please note: FOXX services run in a node-like environment, async is not supported in here, it operates entirely synchronously probably for concurenncy purposes
  // See: https://docs.arangodb.com/3.3/Manual/Foxx/Dependencies.html#compatibility-caveats for some detail
  // Save a new state ID and relate it to the user
  static createOrUpdate (userID, params, done) {
    // Ensure User exists
    const user = User.fetchById(userID)
    if (!user) {
      return done(new Error(`No user found with ID: ${userID}`))
    }
    // Check if we have any state id's stored already
    const existingStateIDs = StateID.fetchByUserID(userID)
    if (existingStateIDs.length) {
      // Check if it matches the state we are trying to save currently
      let existingID = existingStateIDs.filter((stateID) => {
        if (stateID) {
          return stateID.state === params.state
        }
      })[0]

      if (existingID) {
        // Delegate to update()
        StateID.update(userID, existingID, params, done)
      } else {
        // User has other ID's but not for this state
        StateID.create(userID, params, done)
      }
    } else {
      // Delegate to create()
      StateID.create(userID, params, done)
    }
  }

  static update (userID, currentParams, params, done) {
    let now = new Date().toISOString()
    params.update_time = now

    let updateParams = Object.assign(currentParams, params)
    db._query(aql`
      FOR state_id IN state_ids
        FILTER state_id._id == ${currentParams._id}
        UPDATE state_id WITH ${updateParams} IN state_ids
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
      _from: `state_ids/${newID}`,
      _to: `users/${userID}`
    })

    done(null, true) // Indicate we created a new resource
  }

  static delete (userID, state, done) {
    // Check if we have any state id's stored already
    const existingStateIDs = StateID.fetchByUserID(userID)
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
          FOR edge IN state_id_of
            FILTER edge._from == ${existingID._id}
            REMOVE edge IN state_id_of
        `)
        // Delete state id entry
        db._query(aql`
          FOR state_id IN state_ids
            FILTER state_id._id == ${existingID._id}
            REMOVE state_id IN state_ids
        `)

        done(null, true)
      } else {
        // Nothing was deleted
        done()
      }
    }
  }
}

module.exports = StateID
