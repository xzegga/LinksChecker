
// Dependencies

const helpers = require("../api/helpers")

// Define the handlers
const handlers = {}

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404)
}

// Ping handler
handlers.ping = (data, callback) => {
  callback(200)
}

handlers.index = (data, callback) => {

  if(data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'header.title': 'This is the title',
      'header.description': 'This is the meta description',
      'body.title': 'Hello World',
      'body.class': 'index'
    }

    // Read in a template as a string
    helpers.getTemplate('index', templateData, (err, str) => {
      if(err || !str) return callback(500, undefined, 'html')
      
      helpers.addUniversalTemplates(str, templateData, (err, fullString) => {
        if(err || !fullString) return callback(500, undefined, 'html')

        callback(200, fullString, 'html')
      }) 

    }) 
  } else {
    callback(405, undefined, 'html')
  }
  
}


module.exports = handlers