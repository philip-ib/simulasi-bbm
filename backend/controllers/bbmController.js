import { pool } from "../index.js";

// 1. Ambil data awal bensin & motor
export const getDataAwal = async (req, res) => {
  try {
    const bensinResult = await pool.query(
      "SELECT * FROM bensin ORDER BY id ASC",
    );
    const motorResult = await pool.query("SELECT * FROM motor ORDER BY id ASC");
    res.json({ bensin: bensinResult.rows, motor: motorResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Hitung Simulasi BBM (Tetap sama karena tidak pakai DB)
export const hitungSimulasi = (req, res) => {
  const { inputUser, tipeInput, kapasitasTangki, hargaBbm } = req.body;
  let liter =
    tipeInput === "uang"
      ? parseFloat((Number(inputUser) / hargaBbm).toFixed(2))
      : Number(inputUser);
  let rupiah = tipeInput === "uang" ? Number(inputUser) : liter * hargaBbm;
  let persentase = parseFloat(((liter / kapasitasTangki) * 100).toFixed(1));
  let status = liter > kapasitasTangki ? "Meluber! Tangki tidak muat." : "Aman";

  res.json({
    literDidapat: liter,
    totalBiaya: rupiah,
    persentaseTangki: persentase,
    status,
  });
};

// 3. Tambah BBM Baru
export const tambahBbm = async (req, res) => {
  const { nama_bbm, harga } = req.body;
  try {
    await pool.query("INSERT INTO bensin (nama_bbm, harga) VALUES ($1, $2)", [
      nama_bbm,
      harga,
    ]);
    res.json({ message: "BBM baru berhasil disimpan di PostgreSQL!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Update Nama & Harga BBM
export const updateBbm = async (req, res) => {
  const { nama_bbm, harga } = req.body;
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE bensin SET nama_bbm = $1, harga = $2 WHERE id = $3",
      [nama_bbm, harga, id],
    );
    res.json({ message: "Data bensin berhasil diperbarui di PostgreSQL!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Tambah Motor Baru
export const tambahMotor = async (req, res) => {
  const { merek, kapasitas } = req.body;
  try {
    await pool.query("INSERT INTO motor (merek, kapasitas) VALUES ($1, $2)", [
      merek,
      kapasitas,
    ]);
    res.json({ message: "Motor baru berhasil disimpan di PostgreSQL!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Update Motor
export const updateMotor = async (req, res) => {
  const { merek, kapasitas } = req.body;
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE motor SET merek = $1, kapasitas = $2 WHERE id = $3",
      [merek, kapasitas, id],
    );
    res.json({ message: "Data motor berhasil diperbarui di PostgreSQL!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
