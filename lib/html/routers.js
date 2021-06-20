const handlers = require('./handlers')
// Define a request router

module.exports =  {
  'ping': handlers.ping,
  '': handlers.index,
  'account/create': handlers.accountCreate,
  'account/edit': handlers.acountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate,
  'session/deleted': handlers.sesionDeleted,
  'checks/all': handlers.checkList,
  'checks/create': handlers.checkCreate,
  'checks/edit': handlers.checkEdit,
}