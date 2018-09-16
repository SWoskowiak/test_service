const errors = require('@arangodb').errors
const router = require('./router')
const joi = require('joi')
const MedicalID = require('../resources/medical_id')

// users
// name, email, dob

// medical_id
// recommendation number, issuer, state, expiration date, image url/path

// state_id
// state id number, state, expiration date, image url/path

// upload state id and meta-data, view data, update or delete the ID/Rec

// Basic middleware that adds a medical_id resource to res.locals
module.context.use('/v1/medical_id/:user_id', (req, res, next) => {
  const userID = req.pathParams.user_id

  MedicalID.fetch(userID, (err, results) => {
    if (err) {
      return next(err)
    }

    res.locals = res.locals || {}
    res.locals.medicalID = results
    next()
  })
})

// Get medical_id information for a user
router.get('/v1/medical_id/:user_id', (req, res) => {
  res.send(`Hello ${req.pathParams.user_id}!, your medical id# is: ${res.locals.medicalID} `)
})
  .response(['text/plain'], 'A generic greeting.')
  .summary('Generic greeting')
  .description('Prints a generic greeting.')

// Create medical_id information for a user
router.put('/v1/medical_id/:user_id', (req, res, next) => {
  const userID = req.pathParams.user_id
  const params = req.body

  MedicalID.create(userID, params, (err, results) => {
    if (err) {
      return next(err)
    }

    res.json({
      working: true
    })
  })
})
  .body(joi.object().required())
  .description('Creates a new medical ID')
