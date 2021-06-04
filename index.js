/*
* Primary file for the API 
*/

// Dependencies
const http = require('http')
const https = require('https')
const config = require('./lib/config')
const fs = require('fs')
const server = require('./server')

// Instantiate the HTTP server
const httpServer = http.createServer(function (req, res) {
  server(req, res)
});

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
  console.log(`The server is listening on port ${config.httpPort} in ${config.envName} now`)
})


const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

// Instantiate the HTTP server
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  server(req, res)
});

// Start the HTTP server
httpsServer.listen(config.httpsPort, function () {
  console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} now`)
})


// All the server logic for both htpp and https server

