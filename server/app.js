require('app-module-path').addPath(__dirname);

const express = require('express');
const config = require('constants/config');
const parser = require('body-parser');

const app = express();

/* Body Parser */
app.use(parser.json({ limit: '5mb' }));
app.use(parser.urlencoded({ extended: true, limit: '5mb' }));

/* Routes / Controllers */
app.use('/static', express.static(__dirname + '/static'));
app.get('/pay', (req, res) => res.sendFile(__dirname + '/views/Pay.html'));
app.use('/api', require('./controllers/'));

/* Start Server */
const server = app.listen(config.PORT, () =>
  console.log('~~Server running on port', config.PORT)
);
server.timeout = 300000;

if (config.RUN_CRON_JOBS) require('./jobs/cron/start')();
