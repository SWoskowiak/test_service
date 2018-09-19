const moment = require('moment')

module.exports = {
  // Ensure inputs are limited to only what we want to save
  filterInputs: function (req, res, next) {
    const whitelistedParams = [
      'date_of_birth',
      'first_name',
      'last_name',
      'email'
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
  validateDateOfBirth: function (req, res, next) {
    let now = moment()
    let dateOfBirth = res.locals.filteredParams.date_of_birth
    let dob = moment(dateOfBirth)

    // Check for valid birth date
    if (!dob.isValid()) {
      return res.status(400).json({
        message: `Could not parse the given birth date: ${dateOfBirth} for a user`
      })
    }

    // Check if the user is at least 21
    if (now.subtract(21, 'years').isBefore(dob)) {
      return res.status(400).json({
        message: `User with given date of birth: ${dateOfBirth} is not 21`
      })
    }

    next()
  }
}
