import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'db-mysql-sfo2-74281-do-user-18025617-0.l.db.ondigitalocean.com',
    port: 25060,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'defaultdb'
});

export default pool;