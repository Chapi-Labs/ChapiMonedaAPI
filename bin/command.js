#!/app/bin/env node

import express from 'express';
import request from 'request';
import querystring from 'querystring';

export const callBI = () => {
  const form = {
    action: 'getMoneda'
  };

  const formData = querystring.stringify(form);

  request({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    },
    uri: 'http://learn-in.newtonlabs.com.gt',
    body: formData,
    method: 'GET'
  }, (err, response, body) => {
    console.log(body);
  });

}
callBI();
