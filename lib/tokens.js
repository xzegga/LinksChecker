
// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Containers for tokens submethods
const tokens = {}


// Tokens - post
// Require data: phone, password
// Optional data: none
tokens.post = function (data, callback) {
  const {phone, password} = data.payload;
  if(!phone || !password) return callback(400, 'Missing required field');

  _data.read('users', phone, function(err, userData){
    if(err && !userData) return callback(400, {'Error': 'Could not find the specific user'});

    var hashedPassword = helpers.hash(password);
    if(hashedPassword != userData.hashedPassword) return callback(400, 'Password did not match the specified user\'s stored password');

    // If valid create a new token with a random name, set expiration date 1 hour in the future
    const id = helpers.createRandomString(20)
    const expires = Date.now() + 1000 * 60 * 60;

    const tokenObject = {
      phone,
      id,
      expires,
    };

    _data.create('tokens', id, tokenObject, function(err) {
      if(err) return callback(400, {'Error': 'Could not create the new token object fot this user'});

      callback(201, tokenObject)
    })


  })
}

module.exports = tokens