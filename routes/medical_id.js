const router = require('./router')
const joi = require('joi')
const MedicalID = require('../resources/medical_id')
const middleware = require('../middleware/medical_id')

// Get medical_id information for a user
router.get('/v1/user/:user_id/medical_id', (req, res) => {
  const userID = req.pathParams.user_id
  try {
    let data = MedicalID.fetchByUserID(userID)

    if (!data || !data.length) {
      res.status(404).json({
        message: `Medical ID data for user ${userID} not found`
      })
    } else {
      res.status(200).json(data)
    }
  } catch (e) {
    res.status(500).json({
      message: 'Fetching from DB failed',
      raw: e.message
    })
  }
})
  .response(['application/json'], 'Medical ID information')
  .description('Route for returning a given user\'s medical ID data')

// Create/update medical_id information for a user
router.put('/v1/user/:user_id/medical_id', middleware.filterInputs, middleware.validateExpiration,
  (req, res) => {
    const userID = req.pathParams.user_id
    const params = res.locals.filteredParams // Provided by middleware

    try {
      MedicalID.createOrUpdate(userID, params, (err, created) => {
        if (err) throw err

        if (created) {
          res.status(201).json({})
        } else {
          res.status(200).json({})
        }
      })
    } catch (e) {
      res.status(500).json({
        message: 'Failed to save new medical id to database',
        parameters: params,
        raw: e.message
      })
    }
  })
  .body(joi.object({
    expiration_date: joi.date().required(),
    recommendation_number: joi.string().required(),
    issuer: joi.string().required(),
    state: joi.string().required()
  }).required())
  .response(['application/json'], 'The created/updated ID')
  .description('Creates and assigns a new medical ID to a given user or updates a one if the state matches an existing one')

router.delete('/v1/user/:user_id/medical_id/:state',
  (req, res, next) => {
    const userID = req.pathParams.user_id
    const state = req.pathParams.state

    try {
      MedicalID.delete(userID, state, (err, deleted) => {
        if (err) throw err

        if (deleted) {
          res.status(204)
        } else {
          res.status(404)
        }
      })
    } catch (e) {
      res.status(500).json({
        message: 'Failed to delete medical id from database',
        parameters: { userID, state },
        raw: e.message
      })
    }
  })

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
