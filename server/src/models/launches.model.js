const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  console.log('Downloading launch data...');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200 || !response.data) {
    console.error('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;

  if (!Array.isArray(launchDocs)) {
    console.error('Unexpected launch data format - data.docs: ', launchDocs);
    throw new Error('Unexpected launch data format');
  }

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch data already loaded!');
    return;
  }

  await populateLaunches();
}

async function findLaunch(filter) {
  return launches.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return launches.findOne({
    flightNumber: launchId,
  });
}

// Work around the problem MongoDB has with auto-incrementing numbers
async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  return launches.find({}, { _id: 0, __v: 0 });
}

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}

async function saveLaunch(launch) {
  return launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function scheduleNewLaunch(launch) {
  const latestFlightNumber = (await getLatestFlightNumber()) + 1;
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  // very simple referential integrity
  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newLaunch = Object.assign(launch, {
    flightNumber: latestFlightNumber,
    success: true,
    upcoming: true,
    customers: ['NASA'],
  });

  return saveLaunch(newLaunch);
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
