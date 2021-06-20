/*
* Helpers for various task
*/

// Dependencies
const config = require('../config')
const crypto = require('crypto')
const queryString = require('querystring')
const https = require('https');
const path = require('path')
const fs = require('fs');

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

helpers.getTemplate = (template = false, data, callback) => {
  if(!template) return callback('A valid template name was not specified')
  data = typeof(data) === 'object' && data !== null ? data : {}
  const templateDir = path.join(__dirname, '/../../templates/')
  
  fs.readFile(`${templateDir}${template}.html`, 'utf8', (err, str) => {
    if(err || !str) return callback('No template could be found')
    
    const finalString = helpers.interpolate(str, data)
    // Do interpolation on the string 
    callback(false, finalString)
  })
}

// Add the universal header an footer to a string, and pass provided data object to
helpers.addUniversalTemplates = (str, data, callback) => {
  str = typeof(str) === 'string' && str.length > 0 ? str : ''
  data = typeof(data) === 'object' && data !== null ? data : {}

  helpers.getTemplate('_header', data, (errH, headerString) => {
    if(errH || !headerString) return callback('Could not find the header template')

    helpers.getTemplate('_footer', data, (errF, footerrString) => {
      if(errF || !footerrString) return callback('Could not find the footer template')

      callback(false, `${headerString}${str}${footerrString}`)
    })
  })
}

// Take a given string and a data object and rind/replace all the keys withing it
helpers.interpolate = (str, data) => {
  str = typeof(str) === 'string' && str.length > 0 ? str : ''
  data = typeof(data) === 'object' && data !== null ? data : {}

  // Add the template Globlas do the data object, propending their key names with globals
  for(let keyName in config.templateGlobals) {
    if(keyName in config.templateGlobals) {
      data[`global.${keyName}`] = config.templateGlobals[keyName]
    }    
  }

  for(let key in data) {
    if(key in data && typeof(data[key]) === 'string') {
      const replace = data[key]
      const find = `{${key}}`
      str = str.replace(find, replace)

    }    
  }

  return str
}

// Export Conteiner
module.exports = helpers;