import express from 'express';
import request from 'request';
import querystring from 'querystring';
import userRoutes from './user.route';
import authRoutes from './auth.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.get('/moneda/bi', (req, res) => {
  const form = {
    action: 'getMoneda'
  };

  const formData = querystring.stringify(form);

  request({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    },
    uri: 'https://www.corporacionbi.com/service/mod_moneda.php',
    body: formData,
    method: 'POST'
  }, (err, response, body) => {
    res.send(body);
  });
});
// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
