
// Dependencies
const _data = require('../data');
const config = require('../config')
const helpers = require('../helpers')
const tokens = require('./tokens')

// Container for all checs 
const checks = {}

// Check - post
// Required data: protocol, url, method, sucessCodes, timeoutSeconds
// Optional data: none
checks.post = (data, callback) => {

  const {
    protocol = false,
    url = false,
    method = false,
    successCodes = false,
    timeoutSeconds = false } = data.payload

  if (!protocol && !url && !method && !successCodes && !timeoutSeconds)
    return callback(400, { 'Error': 'Missing required inputs, or inputs are invalid' })

  // Get the token from the headers
  const { token } = data.headers

  _data.read('tokens', token, (err, tokenData) => {
    if (err && !tokenData) return callback(403)

    const userPhone = tokenData.phone
    _data.read('users', userPhone, (err, userData) => {
      if (err && !userData) return callback(403)

      // Verify tha the user has less than the number of ma-checks-per-user
      const { userChecks = [] } = userData

      if (userChecks.length >= config.maxChecks)
        return callback(400, { 'Error': `The user already has the maximum number of ${config.maxChecks} checks` })

      const checkId = helpers.createRandomString(20)

      // Create the check object, and include the user's phone
      const checkObject = {
        id: checkId,
        userPhone,
        protocol,
        url,
        method,
        sucessCodes: successCodes,
        timeoutSeconds,
      }

      // Persist the new object
      _data.create('checks', checkId, checkObject, (err) => {
        if (err) return callback(500, { 'Error': 'Could not create the new check' })

        // Add the checkId to the user object
        userData.userChecks = userChecks;
        userData.userChecks.push(checkId)
        // Save the new user data
        _data.update('users', userPhone, userData, (err) => {
          if (err) return callback(500, { 'Error': 'Could not update the user with the new check ' })

          callback(200, checkObject)
        })
      })
    })
  })
}

// Check - get
// Required data: id
// Optional data: none
checks.get = (data, callback) => {
  // Check that the phone number is valid
  const id = data.queryStringObject.get('id');
  if (!id) return callback(400, 'Missing required field');


  // Lookup the check
  _data.read('checks', id, (err, checkData) => {
    if (err && !checkData) return callback(404, { 'Error': `Check ${id} does not exist` })

    const { userPhone } = checkData
    const { token } = data.headers

    if (!token) return callback(403, { 'Error': 'Missing required token in header' })
    // Verify that the given token is valid for the phone number

    tokens.verifyToken(token, userPhone, (tokenIsValid) => {
      if (!tokenIsValid) return callback(403, { 'Error': 'Token in headers is invalid' })

      callback(200, checkData);

    })
  })

}


// Checks - put
// Required data: id
// Optional data: protocol = false, url, method, successCodes, timeoutSeconds
checks.put = (data, callback) => {
  const id = data.queryStringObject.get('id');
  if (!id) return callback(400, 'Missing required field');

  const {
    protocol = false,
    url = false,
    method = false,
    successCodes = false,
    timeoutSeconds = false } = data.payload

  if (!protocol && !url && !method && !successCodes && !timeoutSeconds)
    return callback(400, { 'Error': 'Nothing to update' })
  // Get the tokens from the headers

  _data.read('checks', id, (err, checkData) => {
    if (err && !checkData) return callback(404, { 'Error': `Check ${id} does not exist` })

    const { userPhone } = checkData
    const { token } = data.headers

    if (!token) return callback(403, { 'Error': 'Missing required token in header' })
    // Verify that the given token is valid for the phone number

    tokens.verifyToken(token, userPhone, (tokenIsValid) => {
      if (!tokenIsValid) return callback(403, { 'Error': 'Token in headers is invalid' })

      const updatedCheck = {
        ...checkData,
        protocol,
        url,
        method,
        successCodes,
        timeoutSeconds
      }

      _data.update('checks', id, updatedCheck, (err) => {
        if (err) callback(500, { 'Error': 'Cannot update the check' })

        callback(200, updatedCheck)
      })
    })
  })
}


// Checks - delete
// Required field: id
checks.delete = (data, callback) => {
  const id = data.queryStringObject.get('id');
  if (!id) return callback(400, 'User doesnt exist');

  _data.read('checks', id, (err, checkData) => {
    if (err && !checkData) return callback(404, { 'Error': `Check ${id} does not exist` })

    const { userPhone } = checkData
    const { token } = data.headers

    if (!token) return callback(403, { 'Error': 'Missing required token in header' })
    // Verify that the given token is valid for the phone number

    tokens.verifyToken(token, userPhone, (tokenIsValid) => {
      if (!tokenIsValid) return callback(403, { 'Error': 'Token in headers is invalid' })

      _data.delete('checks', id, (err) => {
        if (err) return callback(500, { 'Error': 'Could not delete the specified check' });

        _data.read('users', userPhone, (err, userData) => {

          if (err && !userData) return callback(400, { 'Error': 'Check was deleted but the user does not exist' })

          // Remove the deleted check from the list of check in the user
          const userChecks = userData.userChecks
          const index = userChecks.indexOf(id)
          if (index > -1) {
            userChecks.splice(index, 1)
            
            _data.update('users', userPhone, userData, (err) => {
              if (err) return callback(500, { 'Error': 'Can not update the user with the check removed' })

              callback(200)
            })
          }

        })
      })
    })
  })

}

module.exports = checks