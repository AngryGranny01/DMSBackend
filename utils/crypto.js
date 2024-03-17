const CryptoJS = require('crypto-js');

function decryptUsingAES256(data, cipherKeyAES) {
  let _key = CryptoJS.enc.Utf8.parse(cipherKeyAES);
  let _iv = CryptoJS.enc.Utf8.parse(cipherKeyAES);
  console.log("Key: "+ cipherKeyAES)
  console.log("Data: "+ data)
  return CryptoJS.AES.decrypt(data, _key, {
    keySize: 16,
    iv: _iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
}

function encryptUsingAES256(data, cipherKeyAES) {
  let _key = CryptoJS.enc.Utf8.parse(cipherKeyAES);
  let _iv = CryptoJS.enc.Utf8.parse(cipherKeyAES);
  return CryptoJS.AES.encrypt(JSON.stringify(data), _key, {
    keySize: 16,
    iv: _iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

function convertAESStringToInt(encrpytedString){
  // Clean up the decrypted value to remove any non-numeric characters
var cleanedValue = encrpytedString.replace(/\D/g, '');

// Parse the cleaned value as an integer
var integerValue = parseInt(cleanedValue, 10);

// Check if the parsing was successful
if (!isNaN(integerValue)) {
    // integerValue now holds the decrypted value as an integer
    console.log("Decrypted integer value:", integerValue);
    return integerValue
} else {
    console.error("Failed to convert decrypted value to an integer.");
    return;
}
}


module.exports = {
  decryptUsingAES256,
  encryptUsingAES256,
  convertAESStringToInt
}

