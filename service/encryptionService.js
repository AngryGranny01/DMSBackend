const CryptoJS = require('crypto-js');

class EncryptionService {
  constructor() {
    this.keySizePBKDF2 = 256;
    this.iterationsPBKDF2 = 10000;
  }

  getPBKDF2Key(password, salt) {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.keySizePBKDF2 / 32,
      iterations: this.iterationsPBKDF2,
    }).toString(CryptoJS.enc.Hex);
  }
}

module.exports = EncryptionService;
