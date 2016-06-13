import express from 'express';
import http from 'http';
import path from 'path';
import iocons from 'socket.io';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import config from './config';

const app = express();
const server = http.Server(app);
const io = iocons(server);


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
 * start server
 */
server.listen(config.port, () => { console.log('SERVER RUNNING'); });
