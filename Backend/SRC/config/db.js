const mysql = require("mysql2/promise");
const db = mysql.createPool({
    host : process.env.DB_HOST , 
    user : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
    queueLimit : 10,
    waitForConnections:true,
    connectionLimit : 10
});

module.exports = db;