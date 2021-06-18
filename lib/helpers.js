/*
* Helpers for various task
*/

// Dependencies
const config = require('./config')
const crypto = require('crypto')
const queryString = require('querystring')
const https = require('https');

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

// Send an SMS message via Twilio
helpers.sendTwilioSMS = (phone, msg, callback) => {
  phone = typeof (phone) === 'string' && phone.trim().length <= 12 ? phone.trim() : false;
  msg = typeof (msg) === 'string' && msg.trim().length === 1600 ? msg.trim() : false;

  if (!phone && !msg) return callback('Given parameters are missing or invalid')

  // Configure the request payload.
  const payload = {
    'From': config.twilio.fromPhone,
    'To': `+503${phone}`,
    'Body': msg
  }
  // Stringify the payload
  const stringPayload = queryString.stringify(payload)
  const requestDetails = {
    'protocol': 'https:',
    'hostname': 'api.twilio.com',
    'path': `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
    'auth': `${config.twilio.accountSid}:${config.twilio.authToken}`,
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    },
    'method': 'POST'
  }

  // Instantiate the request object
  const req = https.request(requestDetails, (res) => {

    // @TODO: maybe save the message response later
    // const chunks = [];
    // res.on('data', chunk => chunks.push(Buffer.from(chunk))) // Converte `chunk` to a `Buffer` object.
    // res.on('end', () => {
    //   const buffer = Buffer.concat(chunks);
    //   console.log(buffer.toString('ascii'));
    // });

    const status = res.statusCode
    if ([200, 201, 301].includes(status)) {
      callback(false)
    } else {
      callback(`Status code returned was ${status}`)
    }
  })

  // Bind the error event so it doesn't get thrown
  req.on('error', (err) => {
    return callback(err)
  })

  // Add the payload
  req.write(stringPayload)

  // End the request
  req.end()

}

// Export Conteiner
module.exports = helpers;