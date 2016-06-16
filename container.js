// shared app state


import config from './config';

import {
  buildApiTokenDecoder,
  buildWebTokenDecoder
} from './src/server/middleware/token';

import * as mdlUser from './src/data/user';

export const mongo = config.mongo;

export const port = config.port;

export const token = {
  secret: config.tokensecret,
  timeout: config.tokentimeout
};

export const middleware = {
  token: {
    checkTokenForApi: buildApiTokenDecoder(token.secret),
    checkTokenForWeb: buildWebTokenDecoder(token.secret)
  }
};

export const User = mdlUser;
