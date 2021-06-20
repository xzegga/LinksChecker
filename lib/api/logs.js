/*
* Library for storing and rotating logs
*/

// Dependencies
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const logs = {}

logs.baseDir = path.join(__dirname, '/../../.logs/')

logs.append = (file, str, callback) => {
  // Opening the file for appending

  fs.open(`${logs.baseDir}${file}.log`, 'a', (err, fileDescriptor) => {
    if (err || !fileDescriptor) return callback('Could not open the file for appending')

    fs.appendFile(fileDescriptor, `${str}\n`, (err) => {
      if (err) return callback('Error appending to file')

      fs.close(fileDescriptor, (err) => {
        if (err) return callback('Error closing file that was beirn appended')

        callback(false)
      })
    })
  })
}


// List all logs and optionaly include the compressed logs
logs.list = (includeCompressedLogs, callback) => {
  fs.readdir(logs.baseDir, (err, data) => {
    if (!err && data && data.length) {
      const trimmedFileNames = []

      data.forEach(fileName => {
        if (fileName.endsWith(".log")) {
          trimmedFileNames.push(fileName.replace('.log', ''))
        }
        // Add o the .gz files 
        if (fileName.endsWith('.gz.b64') && includeCompressedLogs) {
          trimmedFileNames.push(fileName.replace('.gz.b64', ''))
        }
      })

      callback(false, trimmedFileNames)


    } else {
      callback(err, data)
    }
  })
}

// Compress the contents of one .log file into a .gz.b64 file withing the same directory
logs.compress = (logId, newFileId, callback) => {
  const sourceFile = `${logId}.log`
  const destFile = `${newFileId}.gz.b64`

  fs.readFile(`${logs.baseDir}${sourceFile}`, 'utf8', (err, inputString) => {
    if (err || !inputString) return callback(err)

    // Compress the data using gzip
    zlib.gzip(inputString, (err, buffer) => {
      if (err || !buffer) return callback(err)

      // Send the data to the destination file
      fs.open(`${logs.baseDir}${destFile}`, 'xw', (err, fileDescriptor) => {
        if (err || !fileDescriptor) return callback(err)

        fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
          if (err) return callback(err)

          fs.close(fileDescriptor, (err) => {
            if (err) return callback(err)

            callback(false);
          })
        })
      })
    })
  })
}

// Decompress the content of a .gz.b64 file into a string variable
logs.decompress = (fileId, callback) => {
  const fileName = `${fileId}.gz.b64`
  fs.readFile(`${logs.baseDir}${fileName}`, 'utf8', (err, str) => { 
    if(err || !str) return callback(err)

    const inputBuffer = Buffer.from(str, 'base64')
    zlib.unzip(inputBuffer, (err, outputBuffer) => {
      if(err || !outputBuffer) return callback(err)

      const str = outputBuffer.toString()
      callback(false, str)
    })
  })
}

logs.truncate = (logId, callback) => {
  fs.truncate(`${logs.basDir}${logId}.log`, 0, (err) => {
    if(err) return callback(err)

    callback(false)
  })
}


// Export the module
module.exports = logs