// Set the service entry point
// Grab our router definition
const router = require('./routes/router')

// Include our routes
require('./routes/users')
require('./routes/medical_id')
require('./routes/state_id')

module.context.use(router)
