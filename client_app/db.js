import mysql from "mysql2/promise";

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.HOST,
  port: 25060,
  user: process.env.USER,
  password: process.env.PASS,
  database: "defaultdb",
});

export default pool;
