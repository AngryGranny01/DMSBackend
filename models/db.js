let cfg = require('../config/db.config.json')
var mysql = require('mysql2')

let mysqlHost = cfg.database.host
let mysqlPassword = cfg.database.password
let mysqlUser = cfg.database.user
let mysqlDatabase = cfg.database.database


let connectionOption = {
    host: mysqlHost,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
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