const apiRouters = require('./api/routers')
const htmlRouters = require('./html/routers')
// Define a request router

const router = {
  ...apiRouters, 
  ...htmlRouters
} 

module.exports = router;