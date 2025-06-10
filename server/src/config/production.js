module.exports = {
  corsOrigin: [], // Block all cross-origin requests
  dbUri: process.env.MONGO_URI,
  enableDebug: false,
  environment: 'production',
};
