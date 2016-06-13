import express from 'express';
import http from 'http';
import path from 'path';
import iocons from 'socket.io';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import jwt from 'jsonwebtoken';
import config from './config';

const app = express();
const server = http.Server(app);
const io = iocons(server);

/**
 * set global jwt token secret
 */
app.set('tokensecret', config.tokensecret);


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
 * serve index page
 */
app.get('/', (req, res) => {
  res.render('index');
});


/**
 * handle socket connections
 */
io.on('connection', (socket) => {
  console.log('user connected');
});


/**
 * token decoding middleware for api
 * TODO: promisify and refactor to src/server/middleware
 */
const decodeTokenForApi = (req, res, next) => {
  // valid locations of token in api request
  var token = req.body.token ||
              req.query['token'] ||
              req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, app.get('tokensecret'), (err, decoded) => {
      if (err) {
        res.json({
          success: false,
          message: 'failed to authenticate'
        });
      }
      else {
        req.decoded = decoded;
        next();
      }
    });
  }
  else {
    return res.status(403).send({
      success: false,
      message: 'no token provided'
    });
  }
};


/**
 * Api Routes
 * TODO: refactor to separate module
 */
const apiRoutes = express.Router();

apiRoutes.get('/auth', (req, res) => {
  const token = jwt.sign(
  {
    name: 'some name',
    claims: ['reader', 'cool']
  },
  app.get('tokensecret'),
  {
    expiresIn: 86400
  });

  res.json({
    success: true,
    message: 'OK',
    token: token
  });
});


apiRoutes.get('/', decodeTokenForApi, (req, res) => {
  res.json(req.decoded);
});


app.use('/api', apiRoutes);



/**
 * start server
 */
server.listen(config.port, () => { console.log('SERVER RUNNING'); });
