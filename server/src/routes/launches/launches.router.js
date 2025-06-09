const express = require('express');

const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require('./launches.controller');

const launchesRouter = express.Router();

// GET /api/v1/launches
launchesRouter.get('/', httpGetAllLaunches);

// POST /api/v1/launches
// Body: { mission, rocket, launchDate, target }
launchesRouter.post('/', httpAddNewLaunch);

// DELETE /api/v1/launches/:launchId
launchesRouter.delete('/:launchId', httpAbortLaunch);

module.exports = launchesRouter;
