require("dotenv").config(); // harus baris pertama: memuat isi .env ke process.env
const express = require("express");
const pool = require("./db");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(function (req, res, next) {
  console.log(req.method + " " + req.url);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/catatan", async function (req, res) {
  try {
    // Perbaikan: Query SQL digabung menjadi satu baris agar tidak error
    const [rows] = await pool.query("SELECT id, judul, dibuat FROM catatan ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error("Gagal mengambil data catatan:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

app.get("/api/salam/:nama", function (req, res) {   
  res.json({ pesan: "Halo, " + req.params.nama + "!" }); 
}); 

app.get("/api/catatan/:id", async function (req, res) {
    const [rows] = await pool.query(
        "SELECT id, judul, dibuat FROM catatan WHERE id = ?",
        [req.params.id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }
    res.json(rows[0]);
});

app.post("/api/catatan", async function (req, res) {
    const judul = req.body && req.body.judul;

    if (!judul) {
        return res.status(400).json({ error: "Field 'judul' wajib diisi" });
    }

    const [hasil] = await pool.query("INSERT INTO catatan (judul) VALUES (?)",
    [judul]);
    res.status(201).json({ id: hasil.insertId, judul: judul });
});

// Route untuk memperbarui catatan (UPDATE)
app.put("/api/catatan/:id", async function (req, res) {
    const judul = req.body && req.body.judul;

    if (!judul) {
        return res.status(400).json({ error: "Field 'judul' wajib diisi" });
    }

    const [hasil] = await pool.query(
        "UPDATE catatan SET judul = ? WHERE id = ?",
        [judul, req.params.id]
    );

    if (hasil.affectedRows === 0) {
        return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }

    res.json({ id: Number(req.params.id), judul: judul });
});

// Route untuk menghapus catatan (DELETE)
app.delete("/api/catatan/:id", async function (req, res) {
    const [hasil] = await pool.query("DELETE FROM catatan WHERE id = ?", [
        req.params.id
    ]);

    if (hasil.affectedRows === 0) {
        return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }

    res.status(204).end();
});

// route tidak dikenal
app.use(function (req, res) {
    res.status(404).json({ error: "Rute tidak ditemukan: " + req.method + " " + req.url });
});

// penangkap galat; dikenali dari empat parameter (err, req, res, next)
app.use(function (err, req, res, next) {
    console.error(err); // detail lengkap hanya di terminal
    const status = err.status || 500;
    const pesan = status === 500 ? "Terjadi kesalahan pada server" : "Request tidak valid";
    res.status(status).json({ error: pesan });
});

app.listen(PORT, function () {
  console.log("Server berjalan di http://localhost:" + PORT);
});