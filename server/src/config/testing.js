module.exports = {
  serverPort: process.env.PORT || 8000,
  corsOrigin: ['http://localhost:3001'],
  dbUri: process.env.MONGO_TEST_DB_URI,
  enableDebug: true,
  environment: 'test',
};
