const crypto = require('crypto');

/**
 * Hash a string password
 * @param {string} password
 * @returns hashed password
 */
async function hash(password) {
  return new Promise((resolve, reject) => {
    // generate random 16 bytes long salt
    const salt = crypto.randomBytes(16).toString('hex');

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

/**
 * Verifies a password
 * @param {string} password user input password
 * @param {string} hash password stored in hash format
 * @returns
 */
async function verify(password, hash) {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

/**
 * Generates password for suppliers
 * @returns a random string
 */
function generateSupplierPassword() {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).toUpperCase().slice(2)
  );
}

module.exports = { hash, verify, generateSupplierPassword };
