const moment = require('moment')

module.exports = {
  // Ensure inputs are limited to only what we want to save/update
  filterInputs: function (req, res, next) {
    const whitelistedParams = [
      'expiration_date',
      'id_number',
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
    let expirationDate = res.locals.filteredParams.expiration_date
    let expiration = moment(expirationDate)

    // Check for valid expiration date
    if (!expiration.isValid()) {
      return res.status(400).json({
        message: `Could not parse the given expiration date: ${expirationDate} for a state id`
      })
    }

    // Check if the id has expired
    if (now.isAfter(expiration)) {
      return res.status(400).json({
        message: `This state id with the given expiration date of ${expirationDate} is past expiration`
      })
    }

    next()
  }
}
