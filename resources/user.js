const db = require('@arangodb').db
const aql = require('@arangodb').aql
const collection = db._collection('users')

class User {
  static fetchById (userID, done) {
    let result = db._query(aql`
      FOR user IN users
        FILTER user._key == ${userID}
        RETURN user
    `).toArray()[0]

    if (done) {
      return done(null, result)
    } else {
      return result
    }
  }

  // Please note: FOXX services run in a node-like environment, async is not supported in here, it operates entirely synchronously probably for concurenncy purposes
  // See: https://docs.arangodb.com/3.3/Manual/Foxx/Dependencies.html#compatibility-caveats for some detail
  // Save a new user
  static update (userID, params, done) {
    let now = new Date().toISOString()
    params.update_time = now

    db._query(aql`
      FOR user IN users
        FILTER user._key == ${userID}
        UPDATE user WITH ${params} IN users
    `)

    done(null, true)
  }

  // Create a new user
  static create (params, done) {
    // Add some helpful auditing times
    let now = new Date().toISOString()
    params.create_time = now
    params.update_time = now

    const newUser = collection.save(params)._key

    done(null, newUser._key) // Indicate we created a new resource
  }
}

module.exports = User
