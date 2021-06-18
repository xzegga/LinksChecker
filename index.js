/* 
* Primary file for the API
*
*/

// Dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')
var app = {}

app.init = () => {
  // Start the server
  server.init()

  // Start the worker
  workers.init()
}

app.init()

module.exports = app