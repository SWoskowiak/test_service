const router = require('./router')
const joi = require('joi')
const User = require('../resources/user')
const middleware = require('../middleware/user')

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
      raw: e.message
    })
  }
})
  .response(['application/json'], 'User data')
  .description('Route for returning a given user\'s information')

// Create new user
router.post('/v1/user', middleware.filterInputs, middleware.validateDateOfBirth,
  (req, res) => {
    const params = res.locals.filteredParams // Provided by middleware
    try {
      User.create(params, (err, id) => {
        if (err) throw (err)

        res.status(201).json({ key: id })
      })
    } catch (e) {
      res.status(500).json({
        message: 'Failure to save new user to database',
        parameters: params,
        raw: e.message
      })
    }
  })
  .body(joi.object({
    date_of_birth: joi.date().required(),
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    email: joi.string().email().required()
  }).required())
  .response(['application/json'], 'The newly created User ID')
  .description('Creates a new user')

// Update user
router.patch('/v1/user/:user_id', middleware.filterInputs, middleware.validateDateOfBirth,
  (req, res, next) => {
    const params = res.locals.filteredParams // Provided by middleware
    const userID = req.pathParams.user_id

    try {
      User.update(userID, params, (err, updated) => {
        if (err) throw err

        if (updated) {
          res.status(200).json({})
        }
      })
    } catch (e) {
      res.status(500).json({
        message: 'Failed to update user in database',
        parameters: params,
        raw: e
      })
    }
  })
  .body(joi.object({
    date_of_birth: joi.date().required(),
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    email: joi.string().email().required()
  }).required())
  .response(['application/json'], '')
  .description('Updates an existing users information')
