
// Dependencies
const helpers = require('../helpers')
const _data = require('./data');
const tokens = require('./tokens');
const checks = require('./checks');

// Containers for user submethods
const users = {}

// Users - post
// Require data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
users.post = (data, callback) => {
  // Check that all required fields are filled out
  const {
    firtsName = false,
    lastName = false,
    email = false,
    phone = false,
    password = false,
    tosAgreement = false
  } = data.payload;

  if (firtsName && lastName && email && phone && password && tosAgreement) {
    // Make sure that the user doesnt already exist
    _data.read('users', phone, (err) => {
      if (!err) return callback(400, { 'Error': 'A user with that phone number already exist' })

      // Hash the password
      const hashedPassword = helpers.hash(password)
      if (!hashedPassword) return callback(500, { 'Error': 'Could not hash the user\'s password' })

      const userObject = {
        firtsName,
        lastName,
        email,
        phone,
        hashedPassword,
        tosAgreement
      }

      // Store the user
      _data.create('users', phone, userObject, (err) => {
        if (err) return callback(400, { 'Error': 'Could not create the new user'})

        callback(201, { 'Success': `User for ${firtsName} ${lastName} was successfuly created` })
      })

    })
  } else {
    callback(400, { 'Error': 'Missing required fields' })
  }

}

// Users - get
// Required data: phone
// Optional data: none
users.get = (data, callback) => {
  // Check that the phone number is valid
  const phone = data.queryStringObject.get('phone');
  if (!phone) return callback(400, 'Missing required field');

  // Get the tokens from the headers
  const { token } = data.headers
  if (!token) return callback(403, { 'Error': 'Missing required token in header' })
  // Verify that the given token is valid for the phone number

  tokens.verifyToken(token, phone, (tokenIsValid) => {
    if (!tokenIsValid) return callback(403, { 'Error': 'Token in headers is invalid' })

    _data.read('users', phone, (err, userData) => {
      if (err && !userData) return callback(404);

      delete userData.hashedPassword;
      callback(200, userData);
    })
  })

}

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
users.put = (data, callback) => {
  const { phone } = data.payload;
  if (!phone) return callback(400, 'User doesnt exist');

  const {
    firtsName = false,
    lastName = false,
    email = false,
    password = false,
    tosAgreement = false
  } = data.payload;

  if (firtsName || lastName || email || password || tosAgreement) {
    // Get the tokens from the headers
    const { token } = data.headers
    // Verify that the given token is valid for the phone number
    tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (!tokenIsValid) return callback(403, { 'Error': 'Missing required token in header, or token is invalid' })

      _data.read('users', phone, (err, userData) => {
        if (err && !userData) callback(404);

        const userObject = {
          ...userData,
          ...(firtsName ? { firtsName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(tosAgreement ? { tosAgreement } : {}),
          ...(password ? { password: helpers.hash(password) } : {}),
        };

        // Store the new updates
        _data.update('users', phone, userObject, (err) => {
          if (err) return callback(500, { 'Error': 'Could not update the user' });

          callback(200);
        });
      })
    })


  } else {
    callback(400, { 'Error': 'Missing required fields to update' });
  }

}

// Users - delete
// Required field: phone
users.delete = (data, callback) => {
  const phone = data.queryStringObject.get('phone');
  if (!phone) return callback(400, 'User doesnt exist');

  // Get the tokens from the headers
  const { token } = data.headers
  // Verify that the given token is valid for the phone number
  tokens.verifyToken(token, phone, (tokenIsValid) => {
    if (!tokenIsValid) return callback(403, { 'Error': 'Missing required token in header, or token is invalid' })

    _data.read('users', phone, (err, userData) => {
      if (err && !userData) callback(400, { 'Error': 'Could not find the specified user' });

      _data.delete('users', phone, function (err) {
        if (err) return callback(500, { 'Error': 'Could not delete the specified user' });

        // Delete each of the check related with the user
        const userChecks = userData.userChecks
        const checkToDelete = userChecks.length

        if (!checkToDelete) return callback(200)

        let checkDeleted = 0
        let deletionError = false

        // Loop through the checks

        userChecks.forEach(checkId => {
          _data.delete('checks', checkId, (err) => {
            if (err) deletionError = true

            checkDeleted += 1
            if (checkDeleted === checkToDelete) {
              if (deletionError) return callback(500, {
                'Error':'Errors encountered while attemping to delete all the user\'s checks. All chacks may not have been deleted from system succesfully'
              })

              callback(200)
            }

          })
        })

      })

    })
  })

}

module.exports = users;