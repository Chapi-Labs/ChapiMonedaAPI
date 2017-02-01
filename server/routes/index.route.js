import express from 'express';
import request from 'request';
import curl from 'curlrequest';
import querystring from 'querystring';
import userRoutes from './user.route';
import authRoutes from './auth.route';


const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

const promerica = (res, bi) => {
  const options = {
    url: 'https://www.bancopromerica.com.gt/wsservicebus/wsonlineservicebus.asmx/getTipoCambio',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': 0
    },
  };
  const callback = (err, data) => {
    const tempR = JSON.parse(data).d;
    const resultTransform = {
      compraInternet: tempR.compraInternet,
      ventaInternet: tempR.ventaInternet,
      compraAgencia: tempR.compraAgencia,
      ventaAgencia: tempR.ventaAgencia
    };
    res.send({ promerica: resultTransform, bi });
  };
  curl.request(options, callback);
};

const bi = (req, res) => {
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
    const result = JSON.parse(body);
    if (result.Result === 'OK') {
      const resultTransform = {
        compraInternet: result.result[2],
        ventaInternet: result.result[3],
        compraAgencia: result.result[0],
        ventaAgencia: result.result[1]
      };
      promerica(res, resultTransform);
    }
  });
};

router.get('/moneda', (req, res) => {
  bi(req, res);
});

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
