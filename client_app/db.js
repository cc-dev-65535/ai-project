import mysql from "mysql2/promise";

const pool = mysql.createPool({
  connectionLimit: 100,
  host: "db-mysql-sfo2-74281-do-user-18025617-0.l.db.ondigitalocean.com",
  port: 25060,
  user: "doadmin",
  password: "AVNS_tzCT8GU-qoxkojKpj-d",
  database: "defaultdb",
});

export default pool;
