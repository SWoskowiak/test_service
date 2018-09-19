const router = require('./router')
const joi = require('joi')
const User = require('../resources/user')
const middleware = require('../middleware/user')

// users
// name, email, dob

// medical_id
// recommendation number, issuer, state, expiration date, image url/path

// state_id
// state id number, state, expiration date, image url/path

// upload state id and meta-data, view data, update or delete the ID/Rec

// Get user for a given ID
router.get('/v1/user/:user_id', (req, res) => {
  const userID = req.pathParams.user_id
  try {
    let user = User.fetchById(userID)

    if (!user) {
      res.status(404).json({
        message: `User with ID: ${userID} not found`
      })
    }

    res.send(200).json(user)
  } catch (e) {
    res.status(500).json({
      message: 'Fetching from DB failed',
      raw: e
    })
  }
})
  .response(['application/json'], 'User data')
  .description('Route for returning a given user\'s information')

// Create new user
router.put('/v1/user', middleware.filterInputs, middleware.validateDateOfBirth,
  (req, res, next) => {
    const params = res.locals.filteredParams // Provided by middleware

    try {
      User.create(params, (err, id) => {
        if (err) return next(err)

        res.status(201).json(id)
      })
    } catch (e) {
      res.status(500).json({
        message: 'Failure to save new user to database',
        parameters: params,
        raw: e
      })
    }
  })
  .body(joi.object({
    date_of_birth: joi.date().required(),
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    email: joi.string().email().required(),
  }).required())
  .response(['application/json'], 'The newly created ID')
  .description('Creates a new user')
