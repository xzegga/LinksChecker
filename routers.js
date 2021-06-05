const handlers = require('./lib/handlers')
// Define a request router

const router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
}

module.exports = router;