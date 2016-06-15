import express from 'express';
import http from 'http';
import path from 'path';
import iocons from 'socket.io';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import cookieparser from 'cookie-parser';
import jwtcons from 'jsonwebtoken';
import promise from 'bluebird';
import config from './config';

import {
  buildApiTokenDecoder,
  buildWebTokenDecoder
} from './src/server/middleware/token';

const app = express();
const server = http.Server(app);
const io = iocons(server);
const jwt = promise.promisifyAll(jwtcons);

/**
 * set global jwt token secret
 */
app.set('tokensecret', config.tokensecret);


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


const checkTokenForApi = buildApiTokenDecoder(app.get('tokensecret'));
const checkTokenForWeb = buildWebTokenDecoder(app.get('tokensecret'));


/**
 * serve index page
 */
app.get('/', checkTokenForWeb, (req, res) => {
  console.log(req.cookies.webToken);
  res.render('index');
});


/**
 * serve login page
 */
app.get('/login', (req, res) => {
  res.render('login');
});

/**
 * authenticate via web browser
 * TODO: refactor to routes module
 */
app.post('/authenticate', (req, res) => {
  console.log(req.body.inputName);
  console.log(req.body.inputPassword);

  if(req.body.inputName == 'admin' && req.body.inputPassword == 'pass') {
    jwt.signAsync(
      { name: 'admin' },
      app.get('tokensecret'),
      { expiresIn: 86400 }
    ).then(token => {
      return res.cookie('webToken', token, {
        maxAge: 86400,
        httpOnly: true
      }).redirect('/');
    })
    .catch(err => {
      return res.redirect('/login');
    });
  }
  else {
    res.redirect('/login');
  }
});


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


apiRoutes.get('/', checkTokenForApi, (req, res) => {
  res.json(req.decoded);
});


app.use('/api', apiRoutes);



/**
 * start server
 */
server.listen(config.port, () => { console.log('SERVER RUNNING'); });
