/*
* Create unified Server
*/

// Dependencies
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const router = require('../routers');
const handlers = require('../handlers');
const helpers = require('../helpers');

module.exports = (req, res) => {
  // Get the url and parse it
  const baseURL = 'http://' + req.headers.host + '/';
  const parsedUrl = new url.URL(req.url, baseURL);

  // Get the path from url
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the HTTP Method
  const method = req.method.toLowerCase();

  // Get query string as an object
  const queryStringObject = parsedUrl.searchParams

  // Get the headers as an object

  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', function (data) {
    buffer += decoder.write(data);
  })

  req.on('end', function () {
    buffer += decoder.end();

    // Choose the handler this request should go to
    // If one is not found, use the notFound handler

    const chooosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the router
    chooosenHandler(data, function (statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      // Use payload called back by the handler, or default to an empty object
      payload = typeof (payload) == 'object' ? payload : {}

      // Convert payload to a string
      const payloadString = JSON.stringify(payload)

      // Return the resopnse
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString);
      console.log('Returning this response', statusCode, payloadString)
    });
  });
}