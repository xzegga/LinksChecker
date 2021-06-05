
// Dependencies
const users = require('./users')
const tokens = require('./tokens')

// Define the handlers
const handlers = {}

// Not found handler
handlers.notFound = function(data, callback){
  callback(404)
}

// Ping handler
handlers.ping = function(data, callback) {
  callback(200)
}

handlers.users = function(data, callback) {
  const acceptableMthods = ['post', 'get', 'put', 'delete']
  if(acceptableMthods.indexOf(data.method) > -1) {    
    handlers._users[data.method](data, callback)
  } else {
    callback(405)
  }
}

handlers.tokens = function(data, callback) {
  const acceptableMthods = ['post', 'get', 'put', 'delete']
  if(acceptableMthods.indexOf(data.method) > -1) {    
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405)
  }
}




handlers._users = users;
handlers._tokens = tokens;

module.exports = handlers