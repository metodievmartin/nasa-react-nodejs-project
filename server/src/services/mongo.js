const mongoose = require('mongoose');

const { dbUri, environment } = require('../config');

if (!dbUri) {
  throw new Error(
    `Missing config: "dbUri" not provided for "${environment}" environment. Check the config file.`
  );
}

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(dbUri);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
