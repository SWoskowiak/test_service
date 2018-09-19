const db = require('@arangodb').db
const aql = require('@arangodb').aql
const collection = db._collection('medical_ids')
const edgeCollection = db._collection('medical_id_for')

class MedicalID {
  static fetchByUser (userID, done) {

    let userKey = 'users/' + db._collection('users').save({name: 'Foo'})._key

    MedicalID.create(userKey, {}, (err, done) => {
    console.log('USER MADE: ' + userKey)
    let results

    try {
     results = db._query(aql`
      WITH users, medical_ids
      FOR vertex IN 1..1 OUTBOUND ${userKey} medical_id_for
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
    if (newID) {
      edgeCollection.save({
        create_time: Date.now(),
        update_time: Date.now(),
        _from: newID._id,
        _to: `users/${userID}`
      })
    }

    done(null, newID)
  }
}

module.exports = MedicalID
