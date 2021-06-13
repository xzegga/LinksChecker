/* 
* Create and export ocnfigurations variables
*/

// Containers for all environments

const environments = {};

// Staging (default) environment

environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': ' thisIsASecret',
  'maxChecks': 5,
};

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': ' thisIsASecret',
  'maxChecks': 5,
};


// Determine which environent was passes ad command-line argument

// eslint-disable-next-line no-undef
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ?
  // eslint-disable-next-line no-undef
  process.env.NODE_ENV.toLocaleLowerCase() : '';

// Check that the current environment is one of the environment above, if not default to staging

const environentToExport = typeof (environments[currentEnvironment]) == 'object' ?
  environments[currentEnvironment] : environments.staging

// Esport the module
module.exports = environentToExport;