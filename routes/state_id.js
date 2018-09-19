const router = require('./router')
const joi = require('joi')
const StateID = require('../resources/state_id')
const middleware = require('../middleware/state_id')
const insane = require('../middleware/medical_id')

console.log('STATE MIDDLEWARE', middleware.filterInputs)
console.log('STATE MIDDLEWARE', middleware.validateExpiration)
console.log('INSANE', insane)
// users
// name, email, dob

// medical_id
// recommendation number, issuer, state, expiration date, image url/path

// state_id
// state id number, state, expiration date, image url/path

// upload state id and meta-data, view data, update or delete the ID/Rec

// Get state_id information for a user
router.get('/v1/state_id/:user_id', (req, res) => {
  const userID = req.pathParams.user_id
  try {
    let data = StateID.fetchByUser(userID)

    if (!data) {
      res.status(404).json({
        message: `State ID data for user ${userID} not found`
      })
    }

    res.send(200).json(data)
  } catch (e) {
    res.status(500).json({
      message: 'Fetching from DB failed',
      raw: e
    })
  }
})
  .response(['application/json'], 'State ID information')
  .description('Route for returning a given user\'s state ID data')

// Create state_id information for a user
router.put('/v1/state_id/:user_id', middleware.filterInputs, middleware.validateExpiration,
  (req, res, next) => {
    const userID = req.pathParams.user_id
    const params = res.locals.filteredParams // Provided by middleware

    try {
      StateID.createOrUpdate(userID, params, (err, created) => {
        if (err) return next(err)

        if (created) {
          res.status(201).json({})
        } else {
          res.status(200).json({})
        }
      })
    } catch (e) {
      res.status(500).json({
        message: 'Failed to save new state id to database',
        parameters: params,
        raw: e
      })
    }
  })
  .body(joi.object({
    expiration_date: joi.date().required(),
    id_number: joi.string().required(),
    state: joi.string().required()
  }).required())
  .response(['application/json'], 'The newly created ID')
  .description('Creates and assigns a new state ID to a given user')
