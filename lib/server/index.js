/*
* Primary file for the API 
*/

// Dependencies
const http = require('http')
const https = require('https')
const fs = require('fs')
const config = require('../config')
const unifiedServer = require('./server')
const path = require('path')

const server = {}

// Instantiate the HTTP server
server.httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res)
});

server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../../https/cert.pem'))
};

// Instantiate the HTTP server
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
  unifiedServer(req, res)
});


server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, function () {
    console.log(`The server is listening on port ${config.httpPort} in ${config.envName} now`)
  })


  // Start the HTTP server
  server.httpsServer.listen(config.httpsPort, function () {
    console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} now`)
  })
}

module.exports = server
// All the server logic for both htpp and https server

