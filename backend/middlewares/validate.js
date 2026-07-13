// ============================================================
// MIDDLEWARE VALIDASI INPUT
// ============================================================

/**
 * Validasi POST /api/login
 * - username: wajib, tidak kosong
 * - password: wajib, tidak kosong
 */
export function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ error: "Username wajib diisi." });
  }
  if (!password || typeof password !== "string" || password.trim() === "") {
    return res.status(400).json({ error: "Password wajib diisi." });
  }

  next();
}

/**
 * Validasi POST /api/hitung
 * - inputUser: wajib, number, > 0
 * - tipeInput: wajib, enum ["uang", "liter"]
 * - kapasitasTangki: wajib, number, > 0
 * - hargaBbm: wajib, number, > 0
 */
export function validateHitung(req, res, next) {
  const { inputUser, tipeInput, kapasitasTangki, hargaBbm } = req.body;

  if (inputUser == null || isNaN(Number(inputUser)) || Number(inputUser) <= 0) {
    return res.status(400).json({ error: "Jumlah pengisian harus berupa angka positif." });
  }
  if (!tipeInput || !["uang", "liter"].includes(tipeInput)) {
    return res.status(400).json({ error: 'Tipe input harus "uang" atau "liter".' });
  }
  if (kapasitasTangki == null || isNaN(Number(kapasitasTangki)) || Number(kapasitasTangki) <= 0) {
    return res.status(400).json({ error: "Kapasitas tangki harus berupa angka positif." });
  }
  if (hargaBbm == null || isNaN(Number(hargaBbm)) || Number(hargaBbm) <= 0) {
    return res.status(400).json({ error: "Harga BBM harus berupa angka positif." });
  }

  next();
}

/**
 * Validasi POST/PUT /api/bensin
 * - nama_bbm: wajib, string, tidak kosong
 * - harga: wajib, integer, > 0
 */
export function validateBbm(req, res, next) {
  const { nama_bbm, harga } = req.body;

  if (!nama_bbm || typeof nama_bbm !== "string" || nama_bbm.trim() === "") {
    return res.status(400).json({ error: "Nama BBM wajib diisi." });
  }
  if (nama_bbm.trim().length > 100) {
    return res.status(400).json({ error: "Nama BBM maksimal 100 karakter." });
  }
  if (harga == null || isNaN(Number(harga)) || !Number.isInteger(Number(harga)) || Number(harga) <= 0) {
    return res.status(400).json({ error: "Harga BBM harus berupa bilangan bulat positif." });
  }

  next();
}

/**
 * Validasi POST/PUT /api/motor
 * - merek: wajib, string, tidak kosong
 * - kapasitas: wajib, number, > 0
 */
export function validateMotor(req, res, next) {
  const { merek, kapasitas } = req.body;

  if (!merek || typeof merek !== "string" || merek.trim() === "") {
    return res.status(400).json({ error: "Merek motor wajib diisi." });
  }
  if (merek.trim().length > 100) {
    return res.status(400).json({ error: "Merek motor maksimal 100 karakter." });
  }
  if (kapasitas == null || isNaN(Number(kapasitas)) || Number(kapasitas) <= 0) {
    return res.status(400).json({ error: "Kapasitas tangki harus berupa angka positif." });
  }

  next();
}
