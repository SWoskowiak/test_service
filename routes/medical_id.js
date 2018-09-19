const router = require('./router')
const joi = require('joi')
const MedicalID = require('../resources/medical_id')
const middleware = require('../middleware/medical_id')

// users
// name, email, dob

// medical_id
// recommendation number, issuer, state, expiration date, image url/path

// state_id
// state id number, state, expiration date, image url/path

// upload state id and meta-data, view data, update or delete the ID/Rec

// Get medical_id information for a user
router.get('/v1/medical_id/:user_id', (req, res) => {
  res.send(`Hello ${req.pathParams.user_id}!, your medical id# is: ${res.locals.medicalID} `)
})
  .response(['text/plain'], 'A generic greeting.')
  .summary('Generic greeting')
  .description('Prints a generic greeting.')

// Create medical_id information for a user
router.put('/v1/medical_id/:user_id', middleware.filterInputs, middleware.validateExpiration,
  (req, res, next) => {
    const userID = req.pathParams.user_id
    const params = res.locals.filteredParams // Provided by middleware

    MedicalID.create(userID, params, (err, id) => {
      if (err) return next(err)

      res.status(201).json({
        working: id
      })
    })
      // .catch((e) => {
      //   res.status(500).json({
      //     message: 'Failure to save new medical id to database',
      //     parameters: params,
      //     raw: e
      //   })
      // })
  })
  .body(joi.object({
    expiration_date: joi.date().required(),
    recommendation_number: joi.string().required(),
    issuer: joi.string().required(),
    state: joi.string().required()
  }).required())
  .response(['application/json'], 'The newly created ID')
  .description('Creates and assigns a new medical ID to a given user')

// Upload image for a user
// router.post('/v1/medical_id/:user_id/upload', middleware.imageUpload,
//   (req, res, next) => {
//     if (!req.file) {
//       res.status(500).json({
//         message: 'Image failed to save',
//         body: req.body
//       })
//     } else {
//       res.status(201).json({
//         workings: req.file
//       })
//     }
//   })
