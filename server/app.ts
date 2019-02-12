import 'app-module-path/register';
import { RICH_COW_WEB_URL, WEB_DIRECTORY, PORT, PROD } from 'constants/config';
import * as bodyParser from 'body-parser';
import * as Express from 'express';
import { resolve } from 'path';
import { router } from 'api/router';

const app = Express();
if (!PROD) {
  // Needed to allow communication from webpack-dev-server host
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', RICH_COW_WEB_URL);
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, DELETE'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });
}
app.use('/static', Express.static(resolve(WEB_DIRECTORY, 'dist')));
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));
app.use(bodyParser.json({ limit: '2mb' }));
app.use('/api', router);
app.use(
  (
    err: string | Error,
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    if (typeof err == 'string') {
      res.status(400).json({ error: err });
    } else {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong...' });
    }
  }
);
app.get('/*', (req, res) =>
  res.sendFile(resolve(WEB_DIRECTORY, 'dist', 'index.html'))
);
app.listen(PORT, () => console.log('Listening on', PORT));
