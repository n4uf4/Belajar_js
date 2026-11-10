const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// ---------- Middleware ---------- //
// Latihan 4: middleware buatan sendiri (logger). Harus dipasang SEBELUM route.
app.use(function (req, res, next) {
    const jam = new Date().toLocaleTimeString("id-ID");
    console.log(jam + "  " + req.method + "  " + req.url);
    next();
});

// Latihan 4: middleware bawaan Express untuk membaca body berformat JSON
app.use(express.json());

// Latihan 5: menyajikan file statis (HTML/CSS/JS) dari folder "public".
// Karena dipasang di atas route "/", file public/index.html yang tampil di "/".
app.use(express.static(path.join(__dirname, "public")));


// ---------- Latihan 2: route dasar ---------- 
app.get("/", function (req, res) {
    res.send("Halo dari Express!");
});

app.get("/api/salam", function (req, res) {
    res.json({ pesan: "Halo dari API", waktu: new Date().toISOString() });
});


// ---------- Latihan 3: route parameter & query string ---------- 
app.get("/api/salam/:nama", function (req, res) {
    res.json({ pesan: "Halo, " + req.params.nama + "!" });
});

app.get("/api/hitung", function (req, res) {
    const a = parseFloat(req.query.a);
    const b = parseFloat(req.query.b);

    if (isNaN(a) || isNaN(b)) {
        return res.status(400).json({ error: "Parameter a dan b harus berupa angka." });
    }
    
    res.json({ a: a, b: b, hasil: a + b });
});


// ---------- Latihan 4: data in-memory + POST ---------- 
let catatan = [{ id: 1, judul: "Belajar Express" }];
let idBerikutnya = 2;

app.get("/api/catatan", function (req, res) {
    res.json(catatan);
});

app.get("/api/catatan/:id", function (req, res) {
    const id = parseInt(req.params.id);
    const item = catatan.find(function (c) {
        return c.id === id;
    });

    if (!item) {
        return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }
    
    res.json(item);
});

app.post("/api/catatan", function (req, res) {
    const judul = req.body && req.body.judul;

    if (!judul) {
        return res.status(400).json({ error: "Field 'judul' wajib diisi" });
    }

    const baru = { id: idBerikutnya++, judul: judul };
    catatan.push(baru);
    res.status(201).json(baru);
});


// ---------- Route tidak dikenal (dipasang paling akhir) ---------- 
app.use(function (req, res) {
    res.status(404).json({ error: "Rute tidak ditemukan: " + req.method + " " + req.url });
});

app.listen(PORT, function () {
    console.log("Server berjalan di http://localhost:" + PORT);
});