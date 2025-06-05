const { getAllLaunches, addNewLaunch } = require('../../models/launches.model');
const { isValidDate } = require('../../utils');

async function httpGetAllLaunches(req, res) {
  return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
    return res.status(400).json({
      error: 'Missing required launch property',
    });
  }

  const parsedLaunchDate = new Date(launch.launchDate);

  if (!isValidDate(parsedLaunchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  await addNewLaunch(Object.assign(launch, { launchDate: parsedLaunchDate }));

  return res.status(201).json(launch);
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
};
