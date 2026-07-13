import { getDb } from "../db/connection.js";
import { safeErrorMessage } from "../utils/errors.js";

export async function getMotor(req, res) {
  try {
    const db = await getDb();
    const motor = db.prepare("SELECT * FROM motor ORDER BY id ASC").all();
    res.json(motor);
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}

export async function getBbm(req, res) {
  try {
    const db = await getDb();
    const bbm = db.prepare("SELECT * FROM bensin ORDER BY id ASC").all();
    res.json(bbm);
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}

export function hitungSimulasi(req, res) {
  try {
    const { inputUser, tipeInput, kapasitasTangki, hargaBbm } = req.body;

    let literDidapat, totalBiaya;

    if (tipeInput === "uang") {
      literDidapat = parseFloat((inputUser / hargaBbm).toFixed(2));
      totalBiaya = inputUser;
    } else {
      literDidapat = inputUser;
      totalBiaya = parseFloat((inputUser * hargaBbm).toFixed(2));
    }

    const persentaseTangki = parseFloat(((literDidapat / kapasitasTangki) * 100).toFixed(1));
    const status = literDidapat > kapasitasTangki ? "Meluber! Tangki tidak muat." : "Aman";

    res.json({ literDidapat, totalBiaya, persentaseTangki, status });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}

export async function tambahMotor(req, res) {
  try {
    const db = await getDb();
    const { merek, kapasitas } = req.body;
    const result = db.prepare("INSERT INTO motor (merek, kapasitas) VALUES (?, ?)").run(merek, kapasitas);
    res.status(201).json({ message: "Kendaraan berhasil ditambahkan.", id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}

export async function updateMotor(req, res) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { merek, kapasitas } = req.body;
    const result = db.prepare("UPDATE motor SET merek = ?, kapasitas = ? WHERE id = ?").run(merek, kapasitas, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Kendaraan tidak ditemukan." });
    }

    res.json({ message: "Kendaraan berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}

export async function hapusMotor(req, res) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = db.prepare("DELETE FROM motor WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Kendaraan tidak ditemukan." });
    }

    res.json({ message: "Kendaraan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}

export async function tambahBbm(req, res) {
  try {
    const db = await getDb();
    const { nama_bbm, harga } = req.body;
    const result = db.prepare("INSERT INTO bensin (nama_bbm, harga) VALUES (?, ?)").run(nama_bbm, harga);
    res.status(201).json({ message: "BBM berhasil ditambahkan.", id: result.lastInsertRowid });
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Nama BBM sudah ada." });
    }
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}

export async function updateBbm(req, res) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { nama_bbm, harga } = req.body;
    const result = db.prepare("UPDATE bensin SET nama_bbm = ?, harga = ? WHERE id = ?").run(nama_bbm, harga, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "BBM tidak ditemukan." });
    }

    res.json({ message: "BBM berhasil diperbarui." });
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Nama BBM sudah ada." });
    }
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}

export async function hapusBbm(req, res) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const result = db.prepare("DELETE FROM bensin WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "BBM tidak ditemukan." });
    }

    res.json({ message: "BBM berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
}
