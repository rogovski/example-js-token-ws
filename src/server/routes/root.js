import express from 'express';

export default function (container) {
  const signingkey = container.token.secret;
  const timeout = container.token.timeout;

  const webRoutes = express.Router();
  const checkTokenForWeb = container.middleware.token.checkTokenForWeb;

  /**
   * serve index page
   */
  webRoutes.get('/', checkTokenForWeb, (req, res) => {
    console.log('index');
    res.render('index');
  });


  /**
   * serve login page
   */
  webRoutes.get('/login', (req, res) => {
    console.log('login');
    res.render('login');
  });

  return {
    web: webRoutes,
    api: null
  };
}