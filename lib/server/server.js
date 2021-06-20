/*
* Create unified Server
*/

// Dependencies
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const router = require('../routers');
const handlers = require('../api/handlers');
const helpers = require('../api/helpers');

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

    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload, contentType) => {
      let payloadString = ''

      contentType = typeof (contentType) === 'string' ? contentType : 'json'

      // Use the status code called back by the handler, or default to 200
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

      // Return the resopnse parts that are content-spacific

      if (contentType === 'json') {
        payloadString = typeof (payload) === 'object' ? JSON.stringify(payload) : JSON.stringify({})
        contentType = 'application/json'
      }

      if (contentType === 'html') {
        payloadString = typeof (payload) === 'string' ? payload : ''
        contentType = 'text/html'
      }

      res.setHeader('Content-Type', contentType)

      res.writeHead(statusCode)
      res.end(payloadString);

    });
  });
}