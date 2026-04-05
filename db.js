import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "andre711", // coloque a senha se existir
  database: "gelato_acai",
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;

