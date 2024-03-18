const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD } = require("../constants/env");
var mysql = require('mysql2')


let connectionOption = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
}

let connectionPool = mysql.createPool(connectionOption)

console.log('MySQL Connection config')
console.log(connectionOption)


module.exports.connectionPool = connectionPool;