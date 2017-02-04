import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
  auth: {
    api_key: 'key-be6d50f0bce7a323b08af0adc3713036',
    domain: 'mailgun.newtonlabs.com.gt'
  }
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const sendMail = (notification) => {
  nodemailerMailgun.sendMail({
    from: 'notifications@newtonlabs.com.gt',
    to: notification.email, // An array if you have multiple recipients.
    subject: 'Cambió el tipo de cambio !',
    text: `¡El tipo de cambio ${notification.type}
      de ${notification.bank} ha llegado al monto deseado:
      ${notification.content}!`
  });
};

export default sendMail;

