/*
* Worker-related tasks
*/

// Dependencies

const fs = require('fs');
const path = require('path');
const http = require('http')
const https = require('https')
const url = require('url');

const _data = require('../services/data');
const helpers = require('../helpers');

const workers = {}

workers.loop = () => {
  setInterval(function () {
    workers.gatherAllChecks()
  }, 1000 * 60)
}

workers.gatherAllChecks = () => {
  // Get all the checks 

  _data.list('checks', (err, checks) => {
    if (!err && checks && checks.length) {
      checks.forEach(check => {
        _data.read('checks', check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // Pass it to the check validator, and let that function continue or log errors as needed
            workers.validateCheckData(originalCheckData)

          } else {
            console.log({ 'Error': 'The check doesn\'t exist ' + err});
          }
        })
      });
    } else {
      console.log({ 'Error': 'Could not find any chekcs to process' })
    }

  })
}

// Sanity-check the check-data
workers.validateCheckData = (originalCheckData) => {
  originalCheckData = typeof (originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {}
  const {
    id = false,
    userPhone = false,
    protocol = false,
    url = false,
    method = false,
    sucessCodes = false,
    timeoutSeconds = false,
    state = 'down',
    lastChecked = false 
  } = originalCheckData

  // Set the keys that may not be set (if workers have never seen this check before)
  if (id && userPhone && protocol && url && method && sucessCodes && timeoutSeconds) {
    workers. performCheck(originalCheckData)
  } else {
    console.log('Error: One of the check is not property formatted. Skipping it')
  }

}



workers.performCheck = (originalCheckData) => {
  // Prepare the innitial check outcome
  const checkOutcome = {
    'error': false,
    'responseCode': false
  }

  let outcomeSent = false

  const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true)
  const { hostname, path } = parsedUrl

  // Construct the request
  const requestDetail = {
    'protocol': `${originalCheckData.protocol}:`,  
    hostname,
    'method': originalCheckData.method.toUpperCase(),
    'path': path,
    'timeout': originalCheckData.timeoutSeconds * 1000
  }
    
  const _modelToUse = originalCheckData.protocol === 'http' ? http: https

  const req = _modelToUse.request(requestDetail, (res)=> {
    // Grab the status of the sent request
    // Update the checkoutcome and pass the data along
    console.log(res.statusCode)
    checkOutcome.responseCode = res.statusCode

    if( !outcomeSent ) {
      workers.procesCheckOutcome(originalCheckData, checkOutcome)
      outcomeSent = true
    }
  })

  req.on('error', (e)=> {
    checkOutcome.error = {'error': true, 'value': e }

    if(!outcomeSent) {
      workers.procesCheckOutcome(originalCheckData, checkOutcome)
      outcomeSent = true
    }
  })

  // Bind to the timeout 

  req.on('timeout', (e)=> {
    checkOutcome.error = {'error': true, 'value': 'timeout' }

    if(!outcomeSent) {
      workers.procesCheckOutcome(originalCheckData, checkOutcome)
      outcomeSent = true
    }
  })

  req.end()
}

// Process the check outcome, update the check data as needed , trigger an alert if needed
// Special logic for accomodating a check taht has never been tested before (don't alert on that one)
workers.procesCheckOutcome = (originalCheckData, checkOutcome) => {
  // Decide if the check is considerer up or down
  const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.sucessCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down'

  console.log(originalCheckData.sucessCodes)
  // Decide if an alert is warranted
  const alertWarranted = originalCheckData.lastChecked  && originalCheckData.state !== state ? true: false
  
  // Update the check data
  const newCheckData = originalCheckData
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now()

  // Save the update
  _data.update('checks', newCheckData.id, newCheckData, (err) => {
    if(!err) {
      if(alertWarranted) {
        workers.alertUserToSatuschange(newCheckData)
      } else {
        console.log('Check outcome has not changed, no alert needed')
      }

    } else {
      console.log('Error trying to save updates to one of the checks')
    }
  })


}

workers.alertUserToSatuschange = (newCheckData) => {
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`

  helpers.sendTwilioSMS(newCheckData.userPhone, msg, (err) => {
    if(!err) {
      console.log('Success: User was alerted to a status change in their check, via sms', msg) 
    } else {
      console.log('Error: Could not send sms alert to user who had a state change in their check', err)
    }
  })
}

workers.init = () => {
  // Excecute all the checks immediately
  workers.gatherAllChecks(); 

  // Call the loop so the checks will execute later on
  workers.loop()
}

module.exports = workers