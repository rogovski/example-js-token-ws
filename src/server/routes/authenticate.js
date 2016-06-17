import express from 'express';
import jwt from 'jsonwebtoken';
import promise from 'bluebird';

promise.promisifyAll(jwt);

export default function (container) {
  const signingkey = container.token.secret;
  const timeout = container.token.timeout;

  const webRoutes = express.Router();

  /**
   * handle form post
   */
  webRoutes.post('/', (req, res) => {
    if(req.cookies.webToken) {
      console.log('redirect to index');
      res.redirect('/');
    }

    const name = req.body.inputName;
    const password = req.body.inputPassword;

    container.User
      .verify(name, password)
      .then(u => {
        if(!u) {
          throw new Error('user not found');
        }
        return jwt.signAsync(
          { name: name },
          signingkey,
          { expiresIn: timeout }
        );
      })
      .then(token => {
        return res.cookie('webToken', token, {
          httpOnly: true
        }).redirect('/');
      })
      .catch(err => {
        console.log(err);
        res.redirect('/login');
      });
  });

  return {
    web: webRoutes,
    api: null
  };
}
