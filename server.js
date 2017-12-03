import compress from 'compression';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import log from '/shared/log';
import config from './webpack.config.js';

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = process.env.WEB_PORT || 9001;
const app = express();
app.use(compress());

const compiler = webpack(config);
const middleware = webpackMiddleware(compiler, {
  publicPath: config.output.publicPath,
  contentBase: 'src',
  stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false,
  },
});

app.use(middleware);
app.use(webpackHotMiddleware(compiler));
app.use(express.static(__dirname + '/dist/web'));
app.use(function response(req, res) {
  try {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/web/index.html')));
    res.end();
  } catch(err) {
    log.error('Could not read file', req);
  }
});

app.listen(port, (err) => {
  if (err) {
    log.error(err);
  } else {
    log.log(`web listening on port ${port}.`);
  }
});
