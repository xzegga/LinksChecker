
// Dependencies
const users = require('./services/users')
const tokens = require('./services/tokens')
const checks = require('./services/checks')

// Define the handlers
const handlers = {}

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404)
}

// Ping handler
handlers.ping = (data, callback) => {
  callback(200)
}

handlers.users = (data, callback) => {
  const acceptableMthods = ['post', 'get', 'put', 'delete']
  if(acceptableMthods.indexOf(data.method) > -1) {    
    handlers._users[data.method](data, callback)
  } else {
    callback(405)
  }
}

handlers.tokens = (data, callback) => {
  const acceptableMthods = ['post', 'get', 'put', 'delete']
  if(acceptableMthods.indexOf(data.method) > -1) {    
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405)
  }
}

handlers.checks = (data, callback) => {
  const acceptableMthods = ['post', 'get', 'put', 'delete']
  if(acceptableMthods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback)
  } else {
    callback(405)
  }
}

handlers._users = users;
handlers._tokens = tokens;
handlers._checks = checks;

module.exports = handlers