const db = require('@arangodb').db
const aql = require('@arangodb').aql
const collection = db._collection('medical_ids')
const edgeCollection = db._collection('medical_id_of')

class MedicalID {
  static fetchByUser (userID, done) {

    let userKey = 'users/' + db._collection('users').save({name: 'Foo'})._key

    console.log('USER MADE: ' + userKey)
    MedicalID.create(userKey, {}, (err, result) => {
    let results

    try {
     results = db._query(aql`
      WITH users, medical_ids
      FOR vertex IN 1..1 INBOUND ${userKey} medical_id_of
      RETURN vertex
    `).toArray()
    console.log('Results: ', results)
    } catch (e) {
      console.log(e)
    }
    return done(null, results)
    })
  }

  // Save a new medical ID and relate it to the user
  static create (userID, params, done) {
    // Please note: FOXX services run in a node-like environment, async is not properly supported in here, it operates entirely synchronously
    // See: https://docs.arangodb.com/3.3/Manual/Foxx/Dependencies.html#compatibility-caveats
    let newID = collection.save(params)
    console.log(`Created new ID ${newID._key}`)
    if (newID) {
      console.log('CREATING EDGE')
      let edge
      try {
        edge = edgeCollection.save({
          create_time: Date.now(),
          update_time: Date.now(),
          _from: `medical_ids/${newID._key}`,
          _to: `${userID}`
        })
      } catch (e) {
        console.log(e)
      }
      console.log(`Created new Edge ${edge._key}`)
      done(null, newID)
    }

  }
}

module.exports = MedicalID
