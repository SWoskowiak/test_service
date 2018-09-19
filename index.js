// Service entry point
const router = require('./routes/router')

// Include our routes
require('./routes/user')
require('./routes/medical_id')
require('./routes/state_id')

module.context.use(router)
