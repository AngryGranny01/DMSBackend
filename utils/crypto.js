const CryptoJS = require('crypto-js');
const forge = require('node-forge');


//-------------------------------------------- RSA --------------------------------------------------------------//
// Encrypt the data using RSA-OAEP padding
function encryptRSA(data, publicKey) {
  // Convert public key from PEM format
  const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);

  // Encrypt the data using RSA-OAEP padding
  const encryptedData = publicKeyObj.encrypt(forge.util.encodeUtf8(data), 'RSA-OAEP');

  // Convert the encrypted data to Base64
  return forge.util.encode64(encryptedData);
}

function decryptRSA(encryptedData, privateKey) {
  // Convert private key from PEM format
  const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);

  // Convert the encrypted data from Base64
  const encryptedDataBytes = forge.util.decode64(encryptedData);

  // Decrypt the data using RSA-OAEP padding
  const decryptedData = privateKeyObj.decrypt(encryptedDataBytes, 'RSA-OAEP');

  // Convert decrypted binary data to UTF-8 string
  return forge.util.decodeUtf8(decryptedData);
}


//-------------------------------------------- AES 256 --------------------------------------------------------------//
function encryptUsingAES256(data, cipherKeyAES) {
  if (data != String) {
    data = JSON.stringify(data)
  }
  let _key = CryptoJS.enc.Utf8.parse(cipherKeyAES);
  let _iv = CryptoJS.enc.Utf8.parse(cipherKeyAES);
  return CryptoJS.AES.encrypt(data, _key, {
    keySize: 16,
    iv: _iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

function decryptUsingAES256(data, cipherKeyAES) {
  let _key = CryptoJS.enc.Utf8.parse(cipherKeyAES);
  let _iv = CryptoJS.enc.Utf8.parse(cipherKeyAES);

  let decryptedData = CryptoJS.AES.decrypt(data, _key, {
    keySize: 16,
    iv: _iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  let decryptedString = decryptedData.toString(CryptoJS.enc.Utf8);

  return decryptedString;
}


function convertAESStringToInt(encrpytedString) {
  // Parse the cleaned value as an integer
  var integerValue = parseInt(encrpytedString, 10);

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
  convertAESStringToInt,
  encryptRSA,
  decryptRSA,
}

