const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
});

// Tes koneksi database
async function testConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 AS hasil");
        console.log("😀Koneksi MySQL berhasil:", rows[0]);
    } catch (error) {
        console.error("🤬Koneksi MySQL gagal:", error.message);
    }
}

testConnection();

module.exports = pool;