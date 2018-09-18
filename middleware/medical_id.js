const moment = require('moment')

module.exports = {
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
  validateExpiration: function (req, res, next) {
    let now = moment()
    let expirationDate = res.locals.filteredParams.expiration_date
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
  }
}
