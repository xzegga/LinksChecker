
// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

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
    _data.read('users', phone, function (err, data) {
      if (!err) return callback(400, { 'Error': 'A user with that phone number already exist'})

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
// @TODO Only let an authenticated users access their object. Don't let them access anyone else
users.get = function (data, callback) {
  // Check that the phone number is valid
  const phone = data.queryStringObject.get('phone');
  if(!phone) return callback(400, 'Missing required field')

  _data.read('users', phone, function(err, data) {
    if(err && !data) callback(404)

    delete data.hashedPassword;
    callback(200, data)
  })
}

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO: Only let an authenticated user update their own object. Don't let them update anyone else
users.put = function (data, callback) {
  const {phone} = data.payload
  if(!phone) return callback(400, 'User doesnt exist')

  const {
    firtsName = false,
    lastName = false,
    email = false,
    password = false,
    tosAgreement = false
  } = data.payload;

  if (firtsName || lastName || email || password || tosAgreement) {
    _data.read('users', phone, function(err, data) {
      if(err && !data) callback(404)
  
      const userObject = {
        ...data,
        ...(firtsName ? {firtsName}: {}),
        ...(lastName ? {lastName}: {}),
        ...(email ? {email}: {}),
        ...(phone ? {phone}: {}),
        ...(tosAgreement ? {tosAgreement}: {}),
        ...(password ? {password: helpers.hash(password)}: {}),
      }

      // Store the new updates
      _data.update('users', phone, userObject, function(errPt){
        if(errPt) return callback(500, {'Error': 'Could not update the user'})

        callback(200)
      });
    })
  } else {
    callback(400, { 'Error': 'Missing required fields to update' })
  }

}

// Users - delete
// Required field: phone
// @TODO: Only let an authenticated user delete their own object. Don't let them delete anyone else
// @TODO: Cleanup (delete) any other data files associated with this user
users.delete = function (data, callback) {
  const phone = data.queryStringObject.get('phone');
  if(!phone) return callback(400, 'User doesnt exist')

  _data.read('users', phone, function(err, data) {
    if(err && !data) callback(400, {'Error': 'Could not find the specified user'})

    _data.delete('users', phone, function(errDl) {
      if(errDl) return callback(500, {'Error': 'Could not delete the specified user'})

      callback(200)
    })

  })
}

module.exports = users;