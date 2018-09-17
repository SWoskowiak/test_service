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
// module.context.use(async (req, res, next) => {
//   const userID = req.pathParams.user_id
//   res.locals = res.locals || {}

//   res.locals.medicalID = await MedicalID.fetch(userID)
//   return next()
// })

function medicalMiddleware (req, res, next) {
  const userID = req.pathParams.user_id
  res.locals = res.locals || {}

  MedicalID.fetch(userID, (err, id) => {
    if (err) return next(err)

    res.locals.medicalID = id
    next()
  })
}

// Get medical_id information for a user
router.get('/v1/medical_id/:user_id', medicalMiddleware, (req, res) => {
  res.send(`Hello ${req.pathParams.user_id}!, your medical id# is: ${res.locals.medicalID} `)
})
  .response(['text/plain'], 'A generic greeting.')
  .summary('Generic greeting')
  .description('Prints a generic greeting.')

// Create medical_id information for a user
router.put('/v1/medical_id/:user_id', (req, res, next) => {
  const userID = req.pathParams.user_id
  const params = req.body

  MedicalID.create(userID, params, (err, id) => {
    if (err) return next(err)

    console.log('done saving')
    res.status(201).json({
      working: id
    })
  })
})
  .body(joi.object().required())
  .response(['application/json'], 'id of created object')
  .description('Creates a new medical ID')
