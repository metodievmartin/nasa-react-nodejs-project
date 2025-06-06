const env = process.env.NODE_ENV || 'development';

let config;

switch (env) {
  case 'development':
    config = require('./development');
    break;
  case 'production':
    throw new Error('Production config not yet implemented');
  // config = require('./production');
  // break;
  case 'test':
    config = require('./testing');
    break;
  default:
    throw new Error(`Unknown environment: ${env}`);
}

module.exports = config;
