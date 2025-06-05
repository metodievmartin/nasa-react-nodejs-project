const express = require('express');

const { httpGetAllLaunches, httpAddNewLaunch } = require('./launches.controller');

const launchesRouter = express.Router();

// GET /api/v1/launches
launchesRouter.get('/', httpGetAllLaunches);

// POST /api/v1/launches
// Body: { mission, rocket, launchDate, target }
launchesRouter.post('/', httpAddNewLaunch);

module.exports = launchesRouter;
