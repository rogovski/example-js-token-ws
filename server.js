import express from 'express';
import http from 'http';
import path from 'path';
import iocons from 'socket.io';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import cookieparser from 'cookie-parser';
import jwtcons from 'jsonwebtoken';
import promise from 'bluebird';
import mongoose from 'mongoose';
import * as container from './container';
import rootroutector from './src/server/routes/root';
import authroutector from './src/server/routes/authenticate';

const app = express();
const server = http.Server(app);
const io = iocons(server);
const jwt = promise.promisifyAll(jwtcons);


/**
 * configure cookie parser
 */
app.use(cookieparser());


/**
 * configure body parser
 */
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


/**
 * http logging
 */
app.use(morgan('dev'));


/**
 * use ejs as template engine
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/server/views'));


/**
 * server static content
 */
app.use(express.static('public'));


/**
 * handle socket connections
 */
io.on('connection', (socket) => {
  console.log('user connected');
});


/**
 * Api Routes
 * TODO: refactor to separate module
 */
/*
const apiRoutes = express.Router();

apiRoutes.get('/auth', (req, res) => {
  const token = jwt.sign(
  {
    name: 'some name',
    claims: ['reader', 'cool']
  },
  container.token.secret,
  {
    expiresIn: 86400
  });

  res.json({
    success: true,
    message: 'OK',
    token: token
  });
});


apiRoutes.get('/', container.middleware.token.checkTokenForApi, (req, res) => {
  res.json(req.decoded);
});


app.use('/api', apiRoutes);
*/

const rootroute = rootroutector(container);
app.use('/', rootroute.web);

const authroute = authroutector(container);
app.use('/authenticate', authroute.web);

/**
 * start server
 */

const mongodbconn = mongoose.connection;

mongodbconn.on('error', () => {
  console.log('MONGO CONNECTION ERROR');
});

mongodbconn.once('open', () => {
  server.listen(container.port, () => {
    console.log('SERVER RUNNING');
  });
});

mongoose.connect(container.mongo.db);
