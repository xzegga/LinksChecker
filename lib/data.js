/*
* Library for storing and editing data
*/

// Dependencies

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for the module (to be exported)

const lib = {};

// Define the base directory for data
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function (dir, file, data, callback) {
  // Open the fle fo writting
  console.log(`${lib.baseDir}${dir}/${file}.json`)

  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', function (errOp, fileDescriptor) {

    if (errOp && !fileDescriptor) return callback('Could not create new file, it may already exist');
    // Convert data to string
    var stringData = JSON.stringify(data);

    // Write the data to a file and close it
    fs.writeFile(fileDescriptor, stringData, function (err) {
      if (err) return callback('Error writing the new file');
      fs.close(fileDescriptor, function (err) {
        if (err) return callback('Error closing new file');
        callback(false);
      })
    })
  });
}


// Read data from the
lib.read = function (dir, file, callback) {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', function (err, data) {
    const parseData = !err && data ? helpers.parseJsonToObject(data): {};
    callback(err, parseData);
  })
}

lib.update = function (dir, file, data, callback) {
  // Open the file for writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', function (errOp, fileDescriptor) {
    if (errOp && !fileDescriptor) return callback('Could not open the file for updating, it may not exist yet');
    
    var stringData = JSON.stringify(data);
    fs.ftruncate(fileDescriptor, function (errTr) {
      if (errTr) return callback('Error truncating file');

      fs.writeFile(fileDescriptor, stringData, function (errWr) {
        if (errWr) return callback('Error updating the file');

        fs.close(fileDescriptor, function (errCl) {
          if (errCl) return callback('Can not close the file');
          callback(false);
        })
      })
    })
  });
}

lib.delete = function(dir, file, callback) {
  // Unlink the file
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, function(err) {
    if(err) return callback('Error deleting the file, may be not exist');
    
    callback(false);
  })
}


// Export the module
module.exports = lib;