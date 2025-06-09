const http = require('http');

const app = require('./app');
const config = require('./config');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(config.serverPort, () => {
    console.log(`Listening on port ${config.serverPort}...`);
  });
}

startServer();
