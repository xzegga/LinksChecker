
// Dependencies
const _data = require('./data')
const helpers = require('../helpers')

// Containers for tokens submethods
const tokens = {}

// Tokens - post
// Require data: phone, password
// Optional data: none
tokens.post = (data, callback) => {
  const { phone, password } = data.payload;
  if (!phone || !password) return callback(400, 'Missing required field');

  _data.read('users', phone, (err, userData) => {
    if (err && !userData) return callback(400, { 'Error': 'Could not find the specific user' });

    var hashedPassword = helpers.hash(password);
    if (hashedPassword != userData.hashedPassword) return callback(400, 'Password did not match the specified user\'s stored password');

    // If valid create a new token with a random name, set expiration date 1 hour in the future
    const id = helpers.createRandomString(20)
    const expires = Date.now() + 1000 * 60 * 60;

    const tokenObject = {
      phone,
      id,
      expires,
    };

    _data.create('tokens', id, tokenObject, (err) => {
      if (err) return callback(400, { 'Error': 'Could not create the new token object fot this user' });

      callback(201, tokenObject)
    })


  })
}

// Tokens - get
// Require data: phone
// Optional data: none
tokens.get = (data, callback) => {
  // Check that the phone number is valid
  const id = data.queryStringObject.get('id');

  if (!id) return callback(400, 'Missing required field');

  _data.read('tokens', id, (err, tokenData) => {
    if (err && !tokenData) callback(404);
    callback(200, tokenData);
  })
}


// Tokens - put
// Required data: id, extend
// Optional data: none

tokens.put = (data, callback) => {
  const { id, extend } = data.payload;
  if (!id && !extend) return callback(400, 'Missing required fields or fields are invalid');

  _data.read('tokens', id, (err, tokenData) => {
    if (err && !tokenData) callback(404, { 'Error': 'Specified token does not exist' });

    // check to the make sure the token isn't already expired.
    // eslint-disable-next-line no-undef
    if (tokenData.expires <= Date.now()) return callback(400, { 'Error': 'The token has already expired, and cannot be extended' })

    tokenData.expires = Date.now() * 1000 * 60 * 60

    // Store the new updates
    _data.update('tokens', id, tokenData, (err) => {
      if (err) return callback(500, { 'Error': 'Could not update the token\'s expiration' });

      callback(200);
    });
  })
}

// Tokens - delete
// Required field: id
// Optionals data: none
tokens.delete = (data, callback) => {
  const id =  data.queryStringObject.get('id');
  if (!id) return callback(400, 'Missing required fields or fields are invalid');

  _data.read('tokens', id, (err, tokenData) => {
    if(err && !tokenData) callback(400, {'Error': 'Could not find the specified token'});

    _data.delete('tokens', id, (err) => {
      if(err) return callback(500, {'Error': 'Could not delete the specified token'});

      callback(200);
    })

  })
}

tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if(err && !tokenData) return callback(false)

    // check that the token is for the given user and has not expired
    if(tokenData.phone !== phone && tokens.expires < Date.now()) return callback(false)
      
    return callback(true)
  })

}

// Verify if a given token id is currently valid for a given user

module.exports = tokens