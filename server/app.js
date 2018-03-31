require('app-module-path').addPath(__dirname);

const express = require('express');
const config = require('constants/config');
const parser = require('body-parser');
const admyn = require('admyn/server');

const app = express();

/* Body Parser */
app.use(parser.json({ limit: '5mb' }));
app.use(parser.urlencoded({ extended: true, limit: '5mb' }));

/* Admyn */
app.use(
  '/admyn-bmWjQ5O3q9RCoP60YPb1Xu8mCsUVTCv5pHbtVC13dPDN3Fhp2w8l',
  function(req, res, next) {
    req.admyn = { database: config.MYSQL };
    next();
  },
  admyn()
);

/* Routes / Controllers */
app.get('/embed', (req, res) => res.sendFile(__dirname + '/views/Embed.html'));
app.use('/static', express.static(__dirname + '/static'));
app.get('/admin', (req, res) => res.sendFile(__dirname + '/views/Admin.html'));
app.use('/api', require('./controllers/'));

/* Start Server */
const server = app.listen(config.PORT, () =>
  console.log('~~Server running on port', config.PORT)
);
server.timeout = 300000;

if (config.RUN_CRON_JOBS) require('./jobs/cron/start')();