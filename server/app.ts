import 'app-module-path/register';
import { config } from 'dotenv';
config();
import 'enve';

import * as bodyParser from 'body-parser';
import * as Express from 'express';
import { RichCow } from 'types/rich-cow';
import { resolve } from 'path';
import { router } from 'api/router';

declare global {
  namespace NodeJS {
    interface Process {
      enve: RichCow.Env.Server;
    }
  }
}

const app = Express();
if (process.enve.NODE_ENV == 'development') {
  // Needed to allow communication from webpack-dev-server host
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.enve.RICH_COW_WEB_URL);
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
app.use(
  process.enve.STATIC_PATH,
  Express.static(resolve(process.enve.WEB_DIRECTORY, 'dist'))
);
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));
app.use(bodyParser.json({ limit: '2mb' }));
app.use('/api', router);
app.get('/*', (req, res) =>
  res.sendFile(resolve(process.enve.WEB_DIRECTORY, 'dist', 'index.html'))
);
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
app.listen(process.enve.PORT, () =>
  console.log('Listening on', process.enve.PORT)
);
