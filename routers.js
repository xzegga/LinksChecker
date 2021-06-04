const handlers = require('./lib/handlers')
// Define a request router

const router = {
  'ping': handlers.ping,
  'users': handlers.users,
}

module.exports = router;