const CryptoJS = require('crypto-js');
const {ITERATIONS_PKDF2, KEY_SIZE_PKDF2}  = require("../constants/env");


function encryptUsingAES256(data, cipherKeyAES) {
  if(data != String){
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

function encryptPBKDF2Key(password, salt){
  return CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE_PKDF2 / 32,
    iterations: ITERATIONS_PKDF2,
  }).toString(CryptoJS.enc.Hex);
}

function generateUserProjectKey(userPasswordHash, projectKey) {
  // Generate a project-specific key for a user based on their password hash and the project key
  return encryptPBKDF2Key(userPasswordHash, projectKey);
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
  generateUserProjectKey
}

