const { getAllLaunches } = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
  return res.status(200).json(await getAllLaunches());
}

module.exports = {
  httpGetAllLaunches,
};
