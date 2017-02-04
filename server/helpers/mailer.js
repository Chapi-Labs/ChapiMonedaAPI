import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import dotenv from 'dotenv';

dotenv.config();
// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
  auth: {
    api_key: process.env.EMAIL_KEY,
    domain: process.env.EMAIL_HOST
  }
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const parseBank = (bank) => {
  if (bank === 'promerica') {
    return 'Banco Promerica';
  }
  if (bank === 'bi') {
    return 'Banco Industrial';
  }
  return 'Banco no reconocido';
};

export const sendMail = (notification) => {
  nodemailerMailgun.sendMail({
    from: 'notifications@newtonlabs.com.gt',
    to: notification.email, // An array if you have multiple recipients.
    subject: 'Cambió el tipo de cambio !',
    text: `¡El tipo de cambio ${notification.type}
      de ${parseBank(notification.bank)} ha llegado al monto deseado:
      ${notification.content}! \n
      Atentamente, \n
      Newton Labs `
  });
};

export const sendConfirmationEmail = (notification) => {
  nodemailerMailgun.sendMail({
    from: 'notifications@newtonlabs.com.gt',
    to: notification.email, // An array if you have multiple recipients.
    subject: 'Confirmación de cuenta',
    text: `Estimado usuario, \n
      Se ha confirmado la creación de su cuenta \n
      Será notificado cuando el tipo de cambio de ${notification.type} llegue a Q ${notification.amount} por 1$ - ${parseBank(notification.bank)} \n
    Atentamente, \n
    Newton Labs `
  });
};

