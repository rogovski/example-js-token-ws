// bootstrap the application by creating an Admin user

import promise from 'bluebird';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import * as User from './src/data/user';
import config from './config';

promise.promisifyAll(mongoose);
promise.promisifyAll(bcrypt);

const mongodbconn = mongoose.connection;
const adminuser = {
  username: 'admin',
  email: 'admin@admin.com',
  password: 'pass',
  salt: null
};

function runBootstap() {
  bcrypt
    .genSaltAsync(10)
    .then(salt => {
      adminuser.salt = salt;
      return bcrypt.hashAsync(adminuser.password, salt, null);
    })
    .then(hashed => {
      adminuser.password = hashed;
      let u = new User.model(adminuser);
      return u.saveAsync();
    })
    .then(u => {
      console.log(`SAVED: ${u.username}`);
    })
    .catch(err => console.log(err));

}

function verify(username, password) {
  User.model
    .findOneAsync({ username: username })
    .then(u => bcrypt.compareAsync(password, u.password))
    .then(isMatch => {
      console.log(isMatch);
    })
    .catch(err => console.log(err));
}


mongodbconn.on('error', () => {
  console.log('MONGO CONNECTION ERROR');
});

mongodbconn.once('open', () => {
  //verify('admin', 'pass');
  //runBootstap();
  // User.check();
  User.model.findOneAsync({username: 'asd'})
    .then(u => console.log(u));
});

mongoose.connect(config.mongo.db);