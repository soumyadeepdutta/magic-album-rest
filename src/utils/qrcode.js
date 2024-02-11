const QRCode = require('qrcode');

/**
 * Generates QRCode of a plain text
 * @param {string} text plain text in sting
 * @returns dataurl which can be plased inside of </img> tag
 */
module.exports = function (data) {
  return new Promise((resolve, reject) => {
    QRCode.toBuffer(data, (_err, url) => {
      if (_err) return reject(_err);
      resolve(url.toString('base64'));
    });
  });
};
