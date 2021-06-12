
// Dependencies
const _data = require('./data');
const helpers = require('./helpers')
const tokens = require('./tokens')

// Containers for user submethods
const users = {}

// Users - post
// Require data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
users.post = function (data, callback) {
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
    _data.read('users', phone, function (err) {
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
      _data.create('users', phone, userObject, function (err) {
        if (err) return callback(400, { 'Error': ' Could not create the new user' })

        callback(201)
      })

    })
  } else {
    callback(400, { 'Error': 'Missing required fields' })
  }

}

// Users - get
// Required data: phone
// Optional data: none
users.get = function (data, callback) {
  // Check that the phone number is valid
  const phone = data.queryStringObject.get('phone');
  if (!phone) return callback(400, 'Missing required field');

  // Get the tokens from the headers
  const { token } = data.headers
  if(!token) return callback(403, { 'Error': 'Missing required token in header' })
  // Verify that the given token is valid for the phone number
  
  tokens.verifyToken(token, phone, function (tokenIsValid) {    
    if (!tokenIsValid) return callback(403, { 'Error': 'Token in headers is invalid' })

    _data.read('users', phone, function (err, data) {
      if (err && !data) return callback(404);

      delete data.hashedPassword;
      callback(200, data);
    })
  })

}

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
users.put = function (data, callback) {
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
    tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (!tokenIsValid) return callback(403, { 'Error': 'Missing required token in header, or token is invalid' })

      _data.read('users', phone, function (err, data) {
        if (err && !data) callback(404);

        const userObject = {
          ...data,
          ...(firtsName ? { firtsName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(tosAgreement ? { tosAgreement } : {}),
          ...(password ? { password: helpers.hash(password) } : {}),
        };

        // Store the new updates
        _data.update('users', phone, userObject, function (err) {
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
users.delete = function (data, callback) {
  const phone = data.queryStringObject.get('phone');
  if (!phone) return callback(400, 'User doesnt exist');

  // Get the tokens from the headers
  const { token } = data.headers
  // Verify that the given token is valid for the phone number
  tokens.verifyToken(token, phone, function (tokenIsValid) {
    if (!tokenIsValid) return callback(403, { 'Error': 'Missing required token in header, or token is invalid' })

    _data.read('users', phone, function (err, data) {
      if (err && !data) callback(400, { 'Error': 'Could not find the specified user' });

      _data.delete('users', phone, function (err) {
        if (err) return callback(500, { 'Error': 'Could not delete the specified user' });

        callback(200);
      })

    })
  })

}

module.exports = users;