/* eslint-disable */
import * as PDF417 from 'pdf417-generator';

const generateHUB3 = (data) => {
  const amount = data.amount.split('.');

  const code =
    'HRVHUB30\n' +
    'EUR\n' +
    `${(amount[1] ? `${amount[0]}${amount[1]}` : `${amount[0]}00`).padStart(15, '0')}\n` +
    `\n` +
    `\n` +
    `\n` +
    `${data.receiverName}\n` +
    `${data.receiverStreet}\n` +
    `${data.receiverPlace}\n` +
    `${data.iban}\n` +
    `${data.model}\n` +
    `${data.reference}\n` +
    `${data.purpose}\n` +
    `${data.description}\n`;

  const canvas = document.getElementById('barcode');
  PDF417.draw(code, canvas, 3, undefined, 10);
};

export default generateHUB3;
