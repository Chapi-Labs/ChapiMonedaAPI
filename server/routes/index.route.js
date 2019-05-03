import express from 'express';
import request from 'request';
import curl from 'curlrequest';
import { parseString } from 'xml2js';
import querystring from 'querystring';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import notifRoutes from './notification.route';
import Notification from '../models/notification.model';
import ExchangeRate from '../models/exchange_rate.model';
import { sendMail } from '../helpers/mailer';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

const promerica = (req, res, bi, central) => {
  const options = {
    url: 'https://wstasacambio.bancopromerica.com.gt/wsonlineservicebus.asmx/getTipoCambio',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': 0
    },
  };

  const callback = (err, data) => {
    const tempR = JSON.parse(data).d;
    const resultTransform = [
      { rateType: 'compraInternet', value: parseFloat(tempR.compraInternet) },
      { rateType: 'ventaInternet', value: parseFloat(tempR.ventaInternet) },
      { rateType: 'compraAgencia', value: parseFloat(tempR.compraAgencia) },
      { rateType: 'ventaAgencia', value: parseFloat(tempR.ventaAgencia) }
    ];

    const apiMoneda = [
      {
        bank: resultTransform,
        name: 'promerica'
      },
      {
        bank: bi, name: 'bi'
      },
      {
        name: 'Banco Central',
        bank: [{ rateType: 'Banca Central', value: parseFloat(central) }]
      }
    ];

    for (const bank of apiMoneda) {
      const values = bank.bank;
      const name = bank.name;
      new ExchangeRate({
        bank: name,
        rates: values
      }).save();

      for (const currency of values) {
        Notification
          .getByAmountAndTypeAndBank(name, currency.value, currency.rateType)
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

const bi = (req, res, central) => {
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
        { rateType: 'compraInternet', value: parseFloat(result.result[2]) },
        { rateType: 'ventaInternet', value: parseFloat(result.result[3]) },
        { rateType: 'compraAgencia', value: parseFloat(result.result[0]) },
        { rateType: 'ventaAgencia', value: parseFloat(result.result[1]) }
      ];
      promerica(req, res, resultTransform, central);
    }
  });
};
const centralBank = (req, res) => {
  const options = { method: 'POST',
    url: 'http://www.banguat.gob.gt/variables/ws/TipoCambio.asmx',
    headers: { 'content-type': 'application/soap+xml; charset=utf-8' },
    body: '<?xml version="1.0" encoding="utf-8"?>\n<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">\n  <soap12:Body>\n    <TipoCambioDia xmlns="http://www.banguat.gob.gt/variables/ws/" />\n  </soap12:Body>\n</soap12:Envelope>' };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    parseString(body, { ignoreAttrs: true }, (err, result) => {
      if (err) throw new Error(err);
      const central =                  // eslint-disable-line
        result['soap:Envelope']      // eslint-disable-line
        ['soap:Body'][0]             // eslint-disable-line
        ['TipoCambioDiaResponse'][0] // eslint-disable-line
        ['TipoCambioDiaResult'][0]   // eslint-disable-line
        ['CambioDolar'][0]           // eslint-disable-line
        ['VarDolar'][0]              // eslint-disable-line
        ['referencia'][0];           // eslint-disable-line

      bi(req, res, central);
    });
  });
};

router.get('/moneda', (req, res) => {
  centralBank(req, res);
});

// mount user routes at /users
router.use('/users', userRoutes);

//  mount notification routes at /notification
router.use('/notification', notifRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
