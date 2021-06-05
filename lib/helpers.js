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

helpers.parseJsonToObject = function (str) {
  try {
    return JSON.parse(str)
  } catch (err) {
    return {};
  }
}

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function (length) {
  const result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  
  return result.join('');
}

// Export Conteiner
module.exports = helpers;