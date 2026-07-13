export function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ error: "Username harus diisi." });
  }
  if (!password || typeof password !== "string" || password.trim() === "") {
    return res.status(400).json({ error: "Password harus diisi." });
  }

  next();
}

export function validateSimulasi(req, res, next) {
  const { inputUser, tipeInput, kapasitasTangki, hargaBbm } = req.body;

  if (inputUser === undefined || inputUser === null || typeof inputUser !== "number" || inputUser <= 0) {
    return res.status(400).json({ error: "Input harus berupa angka positif." });
  }
  if (!tipeInput || !["uang", "liter"].includes(tipeInput)) {
    return res.status(400).json({ error: 'Tipe input harus "uang" atau "liter".' });
  }
  if (!kapasitasTangki || typeof kapasitasTangki !== "number" || kapasitasTangki <= 0) {
    return res.status(400).json({ error: "Kapasitas tangki harus berupa angka positif." });
  }
  if (!hargaBbm || typeof hargaBbm !== "number" || hargaBbm <= 0) {
    return res.status(400).json({ error: "Harga BBM harus berupa angka positif." });
  }

  next();
}

export function validateBbm(req, res, next) {
  const { nama_bbm, harga } = req.body;

  if (!nama_bbm || typeof nama_bbm !== "string" || nama_bbm.trim() === "") {
    return res.status(400).json({ error: "Nama BBM harus diisi." });
  }
  if (nama_bbm.length > 100) {
    return res.status(400).json({ error: "Nama BBM maksimal 100 karakter." });
  }
  if (!harga || typeof harga !== "number" || harga <= 0 || !Number.isInteger(harga)) {
    return res.status(400).json({ error: "Harga harus berupa bilangan bulat positif." });
  }

  next();
}

export function validateMotor(req, res, next) {
  const { merek, kapasitas } = req.body;

  if (!merek || typeof merek !== "string" || merek.trim() === "") {
    return res.status(400).json({ error: "Merek motor harus diisi." });
  }
  if (merek.length > 100) {
    return res.status(400).json({ error: "Merek motor maksimal 100 karakter." });
  }
  if (!kapasitas || typeof kapasitas !== "number" || kapasitas <= 0) {
    return res.status(400).json({ error: "Kapasitas tangki harus berupa angka positif." });
  }

  next();
}
