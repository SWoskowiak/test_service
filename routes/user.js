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
router.put('/v1/user/:user_id', middleware.filterInputs, middleware.validateDateOfBirth,
  (req, res, next) => {
    const params = res.locals.filteredParams // Provided by middleware
    const userID = req.pathParams.user_id

    try {
      User.createOrUpdate(userID, params, (err, id) => {
        if (err) return next(err)

        if (id) {
          res.status(201).json({ key: id })
        } else {
          res.status(200).json({})
        }
      })
    } catch (e) {
      res.status(500).json({
        message: 'Failure to save new user to database',
        parameters: params,
        raw: e
      })
    }
  })
  .pathParam('user_id', joi.string().optional(), 'ID of user to update')
  .body(joi.object({
    date_of_birth: joi.date().required(),
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    email: joi.string().email().required()
  }).required())
  .response(['application/json'], 'The newly created ID')
  .description('Creates a new user')
