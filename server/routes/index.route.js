import express from 'express';
import request from 'request';
import curl from 'curlrequest';
import querystring from 'querystring';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import notifRoutes from './notification.route';
import Notification from '../models/notification.model';
import { sendMail } from '../helpers/mailer';

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
    const resultTransform = [
      { type: 'compraInternet', value: parseFloat(tempR.compraInternet) },
      { type: 'ventaInternet', value: parseFloat(tempR.ventaInternet) },
      { type: 'compraAgencia', value: parseFloat(tempR.compraAgencia) },
      { type: 'ventaAgencia', value: parseFloat(tempR.ventaAgencia) }
    ];

    const apiMoneda = [
      {
        bank: resultTransform,
        name: 'promerica'
      },
      {
        bank: bi, name: 'bi'
      }
    ];
    for (const bank of apiMoneda) {
      const values = bank.bank;
      const name = bank.name;
      for (const currency of values) {
        Notification
          .getByAmountAndTypeAndBank(name, currency.value, currency.type)
          .then((notifications) => {
            if (notifications.length !== 0) {
              for (const notification of notifications) {
                sendMail(notification);
              }
            }
          });
      }
    }
    res.json('ok');
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
      const resultTransform = [
        { type: 'compraInternet', value: parseFloat(result.result[2]) },
        { type: 'ventaInternet', value: parseFloat(result.result[3]) },
        { type: 'compraAgencia', value: parseFloat(result.result[0]) },
        { type: 'ventaAgencia', value: parseFloat(result.result[1]) }
      ];
      promerica(res, resultTransform);
    }
  });
};

router.get('/moneda', (req, res) => {
  bi(req, res);
});

// mount user routes at /users
router.use('/users', userRoutes);

//  mount notification routes at /notification
router.use('/notification', notifRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
