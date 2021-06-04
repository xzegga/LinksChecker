/*
* Helpers for various task
*/

// Dependencies
const config = require('./config')
const crypto = require('crypto')

// Container for all the helpers

const helpers = {};

// create SHA256 hash
helpers.hash = function (str) {
  if (!typeof (str) == 'string' && str.length < 0) return false;

  return crypto.createHmac('sha256', config.hashingSecret)
    .update(str)
    .digest('hex');

}

helpers.parseJsonToObject = function(str) {
  try {
    return JSON.parse(str)
  } catch (err) {
    return {};
  }
}

// Export Conteiner
module.exports = helpers;