require("dotenv/config");

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_ENV = process.env.EMAIL_ENV;
const PASSWORD_ENV = process.env.PASSWORD_ENV;

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

module.exports = {
    JWT_SECRET,
    EMAIL_ENV,
    PASSWORD_ENV,
    DB_HOST,
    DB_USER,
    DB_NAME,
    DB_PASSWORD,
};