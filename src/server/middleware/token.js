import jwtcons from 'jsonwebtoken';
import promise from 'bluebird';

const jwt = promise.promisifyAll(jwtcons);

export function buildApiTokenDecoder(signingkey) {
  return (req, res, next) => {

    // valid locations of token in api request
    var token = req.body.token ||
                req.query['token'] ||
                req.headers['x-access-token'];


    jwt.verifyAsync(token, signingkey).then(decoded => {
      req.decoded = decoded;
      return next();
    })
    .catch(err => {
      switch (err.message) {
        case 'jwt must be provided':
          return res.status(403).send({
            success: false,
            message: 'no token provided'
          });
        default:
          return res.json({
            success: false,
            message: 'failed to authenticate'
          });
      }
    });
  };
}

export function buildWebTokenDecoder(signingkey) {
  return (req, res, next) => {
    var token = req.cookies.webToken;

    jwt.verifyAsync(token, signingkey).then(decoded => {
      req.decoded = decoded;
      return next();
    })
    .catch(err => {
      return res.redirect('/login');
    });
  };
}
