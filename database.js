const { createPool } = require('mysql');

const pool = createPool({
    host:'localhost',
    user:'root',
    password: '',
    database:'online-marketplace',
    connectionLimit: 10
})

module.exports = pool;