const handlers = require('./handlers')
// Define a request router

module.exports =  {
  'ping': handlers.ping,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/checks': handlers.checks,
} 