const CryptoJS = require('crypto-js');
const { ITERATIONS_PKDF2, KEY_SIZE_PKDF2 } = require("../constants/env");
const NodeRSA = require('node-rsa');


function encryptRSA(data, publicKey) {
  // Create an RSA key object from the provided public key
  const key = new NodeRSA(publicKey);

  // Encrypt the data using the public key
  const encryptedData = key.encrypt(data, 'base64');

  return encryptedData;
}

function decryptRSA(encryptedData, privateKey) {
  // Create an RSA key object from the provided private key
  const key = new NodeRSA(privateKey);

  // Decrypt the encrypted data using the private key
  const decryptedData = key.decrypt(encryptedData, 'utf8');

  return decryptedData;
}

async function decryptUserDataRSA(userData, privateKey) {
  const rsaKey = new NodeRSA(privateKey);
  const decryptedUserData = {};
  try {
    for (const [propertyName, value] of Object.entries(userData)) {
      // Exclude certain properties from decryption
      if (propertyName === "privateKey" || propertyName === "salt"|| propertyName === "userID" || propertyName === "publicKey" || value === "" || typeof value !== 'string') {
        decryptedUserData[propertyName] = value;
      } else {
        // Decrypt the encrypted value using the private key
        const decryptedValue = rsaKey.decrypt(value, 'utf8');
        // Set the decrypted value in the decryptedUserData object
        decryptedUserData[propertyName] = decryptedValue;
      } 
    }
    return decryptedUserData;
  } catch (error) {
    console.error('Error decrypting userData:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

async function encryptUserDataRSA(userData, publicKey) {
  const rsaKey = new NodeRSA(publicKey);
  const encryptedUserData = {};
  try {
    for (const [propertyName, value] of Object.entries(userData)) {
      // Exclude certain properties from encryption
      if (propertyName === "privateKey" || propertyName === "salt" || propertyName === "publicKey" || propertyName === "userID" || value === "" || typeof value !== 'string') {
        encryptedUserData[propertyName] = value;
      } else {
        encryptedUserData[propertyName] = rsaKey.encrypt(value, 'base64');
      }
    }
    return encryptedUserData;
  } catch (error) {
    console.error('Error encrypting userData:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
}



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

function encryptPBKDF2Key(password, salt) {
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
  generateUserProjectKey,
  encryptRSA,
  decryptRSA,
  decryptUserDataRSA,
  encryptUserDataRSA
}

