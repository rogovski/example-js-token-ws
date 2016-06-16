import mongoose from 'mongoose';
import promise from 'bluebird';
import bcrypt from 'bcrypt-nodejs';

promise.promisifyAll(mongoose);
promise.promisifyAll(bcrypt);

const Schema = mongoose.Schema;

/**
 * user model as jsonschema
 */
export const schema = {
  id: 'User',
  type: 'object',
  properties: {
    username: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    salt: { type: 'string' }
  },
  required: [
    'username',
    'email',
    'password',
    'salt'
  ]
};


/**
 * TODO: need to create library devoted to
 * mapping jsonschema defs to various persistance
 * layers. do it manually for now
 */
export const model = mongoose.model('User', new Schema({
  username: String,
  email: String,
  password: String,
  salt: String
}));


/**
 * check provided @password matches hashed
 * password for the given @username.
 * TODO: return false (or null) if user not
 * found or if hash compare failed. return the
 * user object if verification was successful.
 * the returned object has password and salt fields omitted (_.omit)
 */
export function verify(username, password) {
  return model
    .findOneAsync({ username: username })
    .then(u => bcrypt.compareAsync(password, u.password));
}
