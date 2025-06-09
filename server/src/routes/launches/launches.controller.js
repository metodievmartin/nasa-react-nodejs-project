const {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require('../../models/launches.model');
const { isValidDate } = require('../../utils');
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);

  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
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

  await scheduleNewLaunch(
    Object.assign(launch, { launchDate: parsedLaunchDate })
  );

  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.launchId);
  const existsLaunch = await existsLaunchWithId(launchId);

  if (!existsLaunch) {
    return res.status(404).json({
      error: 'Launch not found',
    });
  }

  const aborted = await abortLaunchById(launchId);

  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    });
  }

  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
