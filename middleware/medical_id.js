const moment = require('moment')
const multer = require('multer')
const path = require('path')

// Quick file upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, `uploads/${req.pathParams.user_id}/medical_id`))
  },
  filename: (req, file, cb) => {
    cb(null, `${req.userID}-${Date.now()}-${file.fieldname}`)
  }
})

module.exports = {
  // Ensure inputs are limited to only what we want to save
  filterInputs: function (req, res, next) {
    const whitelistedParams = [
      'expiration_date',
      'recommendation_number',
      'issuer',
      'state'
    ]

    let filteredParams = {}
    whitelistedParams.forEach((val) => {
      filteredParams[val] = req.body[val]
    })

    res.locals = res.locals || {}
    res.locals.filteredParams = filteredParams
    next()
  },
  // Make sure we check the expiration date before accepting an ID
  validateExpiration: function (req, res, next) {
    let now = moment()
    let expirationDate = res.locals.filteredParams.expiration_dat
    let expiration = moment(expirationDate)

    // Check for valid expiration date
    if (!expiration.isValid()) {
      return res.status(400).json({
        message: `Could not parse the given expiration date: ${expirationDate} for a medical id`
      })
    }

    // Check if the id has expired
    if (now.isAfter(expiration)) {
      return res.status(400).json({
        message: `This medical id with the given expiration date of ${expirationDate} is past expiration`
      })
    }

    next()
  },
  handleImageUpload: multer({
    storage: storage,
    limits: {
      fileSize: 2000000, // 2MB limit
      files: 1 // Only one file at a time
    }
  })
}
