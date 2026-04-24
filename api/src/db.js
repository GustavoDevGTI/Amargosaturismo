const mysql = require("mysql2/promise");
const { db } = require("./config");

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: db.host,
      port: db.port,
      database: db.database,
      user: db.user,
      password: db.password,
      connectionLimit: 10,
      waitForConnections: true,
      charset: "utf8mb4"
    });
  }

  return pool;
}

async function runQuery(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

module.exports = {
  getPool,
  runQuery
};
