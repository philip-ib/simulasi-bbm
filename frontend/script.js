// ============================================================
// KONFIGURASI API
// ============================================================
const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.protocol === "file:"
    ? `http://${window.location.hostname || "localhost"}:5000/api`
    : window.location.origin + "/api";

// ============================================================
// STATE MANAGEMENT SEDERHANA
// ============================================================
const state = {
  currentTab: "simulasi",
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  listMotor: [],
  listBbm: [],
  selectedMotor: null,
  selectedBbm: null,
  tipeInput: "uang",
  inputUser: "",
  hasil: {},
  bbmToUpdate: null,
  motorToUpdate: null,
};

// ============================================================
// DOM REFERENCES
// ============================================================
const $ = (id) => document.getElementById(id);

const dom = {
  // Navbar
  tabSimulasi: $("tabSimulasi"),
  tabAdmin: $("tabAdmin"),

  // Tabs
  simulasiTab: $("simulasiTab"),
  adminTab: $("adminTab"),

  // Simulasi
  selectMotor: $("selectMotor"),
  selectBbm: $("selectBbm"),
  inputUser: $("inputUser"),
  tankFill: $("tankFill"),
  tankPercent: $("tankPercent"),
  hasilLiter: $("hasilLiter"),
  hasilHarga: $("hasilHarga"),
  hasilStatus: $("hasilStatus"),

  // Login
  loginForm: $("loginForm"),
  loginUsername: $("loginUsername"),
  loginPassword: $("loginPassword"),
  loginBtn: $("loginBtn"),
  loginError: $("loginError"),

  // Admin Panel
  adminPanel: $("adminPanel"),
  logoutBtn: $("logoutBtn"),
  adminError: $("adminError"),

  // Add Motor
  newMotorNama: $("newMotorNama"),
  newMotorKapasitas: $("newMotorKapasitas"),
  tambahMotorBtn: $("tambahMotorBtn"),

  // Add BBM
  newBbmNama: $("newBbmNama"),
  newBbmHarga: $("newBbmHarga"),
  tambahBbmBtn: $("tambahBbmBtn"),

  // Update BBM
  bbmToUpdate: $("bbmToUpdate"),
  updateBbmFields: $("updateBbmFields"),
  updateBbmNama: $("updateBbmNama"),
  updateBbmHarga: $("updateBbmHarga"),
  updateBbmBtn: $("updateBbmBtn"),

  // Update Motor
  motorToUpdate: $("motorToUpdate"),
  updateMotorFields: $("updateMotorFields"),
  updateMotorNama: $("updateMotorNama"),
  updateMotorKapasitas: $("updateMotorKapasitas"),
  updateMotorBtn: $("updateMotorBtn"),
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function showError(el, message) {
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideError(el) {
  el.classList.add("hidden");
  el.textContent = "";
}

function setLoading(btn, isLoading, text = "Memproses...") {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? text : btn.dataset.originalText;
}

function formatRupiah(num) {
  return "Rp" + Number(num).toLocaleString("id-ID");
}

// ============================================================
// API CALLS
// ============================================================
async function loadDataAwal() {
  try {
    const res = await fetch(`${API_URL}/data-awal`);
    const data = await res.json();
    state.listBbm = data.bensin || [];
    state.listMotor = data.motor || [];
    renderSelectMotor();
    renderSelectBbm();
    renderUpdateSelects();
    if (state.listMotor.length) state.selectedMotor = state.listMotor[0];
    if (state.listBbm.length) state.selectedBbm = state.listBbm[0];
    dom.selectMotor.value = "0";
    dom.selectBbm.value = "0";
  } catch (e) {
    console.error("Gagal memuat data awal:", e);
    // Tampilkan pesan error di halaman jika data tidak bisa dimuat
    const errorDiv = document.createElement("div");
    errorDiv.className =
      "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm";
    errorDiv.textContent =
      "⚠️ Gagal memuat data dari server. Pastikan backend sudah berjalan.";
    document.querySelector(".max-w-4xl").prepend(errorDiv);
  }
}

async function hitungSimulasi() {
  const val = dom.inputUser.value.trim();
  if (!val || !state.selectedMotor || !state.selectedBbm) {
    resetHasil();
    return;
  }
  try {
    const res = await fetch(`${API_URL}/hitung`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputUser: val,
        tipeInput: state.tipeInput,
        kapasitasTangki: state.selectedMotor.kapasitas,
        hargaBbm: state.selectedBbm.harga,
      }),
    });
    state.hasil = await res.json();
    renderHasil();
  } catch (e) {
    console.error("Gagal menghitung simulasi:", e);
  }
}

async function handleLogin() {
  const username = dom.loginUsername.value.trim();
  const password = dom.loginPassword.value.trim();

  if (!username || !password) {
    showError(dom.loginError, "Username dan password harus diisi!");
    return;
  }

  hideError(dom.loginError);
  setLoading(dom.loginBtn, true);

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (res.status !== 200) {
      showError(dom.loginError, data.error);
      return;
    }

    state.isLoggedIn = true;
    localStorage.setItem("isLoggedIn", "true");
    dom.loginUsername.value = "";
    dom.loginPassword.value = "";
    renderAdminView();
  } catch (e) {
    showError(dom.loginError, "Gagal terhubung ke server backend!");
  } finally {
    setLoading(dom.loginBtn, false);
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    console.error("Logout gagal:", e);
  }
  state.isLoggedIn = false;
  localStorage.removeItem("isLoggedIn");
  renderAdminView();
}

async function handleProtectedResponse(res) {
  if (res.status === 401 || res.status === 403) {
    alert("Sesi Anda telah habis atau tidak valid. Silakan login kembali.");
    await handleLogout();
    return null;
  }
  return res;
}

async function tambahMotor() {
  const nama = dom.newMotorNama.value.trim();
  const kapasitas = dom.newMotorKapasitas.value.trim();

  if (!nama || !kapasitas) {
    showError(dom.adminError, "Nama motor dan kapasitas harus diisi!");
    return;
  }

  hideError(dom.adminError);
  setLoading(dom.tambahMotorBtn, true);

  try {
    const res = await fetch(`${API_URL}/motor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ merek: nama, kapasitas: parseFloat(kapasitas) }),
    });
    if (!(await handleProtectedResponse(res))) return;
    const data = await res.json();
    if (res.status !== 200) {
      showError(dom.adminError, data.error);
      return;
    }
    alert("Sukses menambah motor!");
    dom.newMotorNama.value = "";
    dom.newMotorKapasitas.value = "";
    await loadDataAwal();
  } catch (e) {
    showError(dom.adminError, "Gagal terhubung ke server!");
  } finally {
    setLoading(dom.tambahMotorBtn, false);
  }
}

async function tambahBbm() {
  const nama = dom.newBbmNama.value.trim();
  const harga = dom.newBbmHarga.value.trim();

  if (!nama || !harga) {
    showError(dom.adminError, "Nama BBM dan harga harus diisi!");
    return;
  }

  hideError(dom.adminError);
  setLoading(dom.tambahBbmBtn, true);

  try {
    const res = await fetch(`${API_URL}/bensin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nama_bbm: nama, harga: parseInt(harga) }),
    });
    if (!(await handleProtectedResponse(res))) return;
    const data = await res.json();
    if (res.status !== 200) {
      showError(dom.adminError, data.error);
      return;
    }
    alert("Sukses menambah BBM baru!");
    dom.newBbmNama.value = "";
    dom.newBbmHarga.value = "";
    await loadDataAwal();
  } catch (e) {
    showError(dom.adminError, "Gagal terhubung ke server!");
  } finally {
    setLoading(dom.tambahBbmBtn, false);
  }
}

function isiFormUpdateBbm() {
  const val = dom.bbmToUpdate.value;
  if (!val) {
    state.bbmToUpdate = null;
    dom.updateBbmFields.classList.add("hidden");
    return;
  }
  state.bbmToUpdate = JSON.parse(val);
  dom.updateBbmNama.value = state.bbmToUpdate.nama_bbm;
  dom.updateBbmHarga.value = state.bbmToUpdate.harga;
  dom.updateBbmFields.classList.remove("hidden");
}

async function updateDataBbm() {
  if (!state.bbmToUpdate) return;
  const nama = dom.updateBbmNama.value.trim();
  const harga = dom.updateBbmHarga.value.trim();

  if (!nama || !harga) {
    showError(dom.adminError, "Data BBM tidak lengkap!");
    return;
  }

  hideError(dom.adminError);
  setLoading(dom.updateBbmBtn, true);

  try {
    const res = await fetch(`${API_URL}/bensin/${state.bbmToUpdate.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nama_bbm: nama, harga: parseInt(harga) }),
    });
    if (!(await handleProtectedResponse(res))) return;
    const data = await res.json();
    if (res.status !== 200) {
      showError(dom.adminError, data.error);
      return;
    }
    alert("Sukses mengubah data BBM!");
    state.bbmToUpdate = null;
    dom.bbmToUpdate.value = "";
    dom.updateBbmFields.classList.add("hidden");
    await loadDataAwal();
  } catch (e) {
    showError(dom.adminError, "Gagal terhubung ke server!");
  } finally {
    setLoading(dom.updateBbmBtn, false);
  }
}

function isiFormUpdateMotor() {
  const val = dom.motorToUpdate.value;
  if (!val) {
    state.motorToUpdate = null;
    dom.updateMotorFields.classList.add("hidden");
    return;
  }
  state.motorToUpdate = JSON.parse(val);
  dom.updateMotorNama.value = state.motorToUpdate.merek;
  dom.updateMotorKapasitas.value = state.motorToUpdate.kapasitas;
  dom.updateMotorFields.classList.remove("hidden");
}

async function updateDataMotor() {
  if (!state.motorToUpdate) return;
  const nama = dom.updateMotorNama.value.trim();
  const kapasitas = dom.updateMotorKapasitas.value.trim();

  if (!nama || !kapasitas) {
    showError(dom.adminError, "Data motor tidak lengkap!");
    return;
  }

  hideError(dom.adminError);
  setLoading(dom.updateMotorBtn, true);

  try {
    const res = await fetch(`${API_URL}/motor/${state.motorToUpdate.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ merek: nama, kapasitas: parseFloat(kapasitas) }),
    });
    if (!(await handleProtectedResponse(res))) return;
    const data = await res.json();
    if (res.status !== 200) {
      showError(dom.adminError, data.error);
      return;
    }
    alert("Sukses memperbarui data motor!");
    state.motorToUpdate = null;
    dom.motorToUpdate.value = "";
    dom.updateMotorFields.classList.add("hidden");
    await loadDataAwal();
  } catch (e) {
    showError(dom.adminError, "Gagal terhubung ke server!");
  } finally {
    setLoading(dom.updateMotorBtn, false);
  }
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderSelectMotor() {
  dom.selectMotor.innerHTML = state.listMotor
    .map((m, i) => `<option value="${i}">${m.merek} (${m.kapasitas}L)</option>`)
    .join("");
}

function renderSelectBbm() {
  dom.selectBbm.innerHTML = state.listBbm
    .map(
      (b, i) => `<option value="${i}">${b.nama_bbm} (Rp${b.harga}/L)</option>`,
    )
    .join("");
}

function renderUpdateSelects() {
  // BBM update select
  dom.bbmToUpdate.innerHTML =
    `<option value="">-- Pilih BBM yang Akan Diubah --</option>` +
    state.listBbm
      .map(
        (b) =>
          `<option value='${JSON.stringify(b)}'>${b.nama_bbm} (Rp${b.harga})</option>`,
      )
      .join("");

  // Motor update select
  dom.motorToUpdate.innerHTML =
    `<option value="">-- Pilih Motor yang Akan Diubah --</option>` +
    state.listMotor
      .map(
        (m) =>
          `<option value='${JSON.stringify(m)}'>${m.merek} (${m.kapasitas}L)</option>`,
      )
      .join("");
}

function resetHasil() {
  state.hasil = {};
  dom.tankFill.style.height = "0%";
  dom.tankFill.className =
    "w-full transition-all duration-500 ease-out bg-emerald-500";
  dom.tankPercent.textContent = "0%";
  dom.hasilLiter.textContent = "0 Liter";
  dom.hasilHarga.textContent = "Rp0";
  dom.hasilStatus.textContent = "Menunggu Input";
  dom.hasilStatus.className =
    "font-bold text-slate-400 px-2 py-0.5 rounded border";
}

function renderHasil() {
  const h = state.hasil;
  const pct = h.persentaseTangki || 0;

  // Tank fill
  dom.tankFill.style.height = Math.min(pct, 100) + "%";
  let barColor = "bg-emerald-500";
  if (pct <= 20) barColor = "bg-red-600";
  else if (pct <= 50) barColor = "bg-amber-400";
  dom.tankFill.className = `w-full transition-all duration-500 ease-out ${barColor}`;

  dom.tankPercent.textContent = pct + "%";
  dom.hasilLiter.textContent = (h.literDidapat || 0) + " Liter";
  dom.hasilHarga.textContent = formatRupiah(h.totalBiaya || 0);

  // Status
  let statusText, statusClass;
  if (!pct) {
    statusText = "Menunggu Input";
    statusClass = "font-bold text-slate-400 px-2 py-0.5 rounded border";
  } else if (h.status !== "Aman") {
    statusText = h.status;
    statusClass =
      "font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200";
  } else if (pct <= 20) {
    statusText = "⚠️ bensin sekarat segera isi";
    statusClass =
      "font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200";
  } else if (pct <= 50) {
    statusText = "⚡ masih aman";
    statusClass =
      "font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200";
  } else {
    statusText = "✅ aman";
    statusClass =
      "font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200";
  }

  dom.hasilStatus.textContent = statusText;
  dom.hasilStatus.className = statusClass;
}

function renderAdminView() {
  if (state.isLoggedIn) {
    dom.loginForm.classList.add("hidden");
    dom.adminPanel.classList.remove("hidden");
  } else {
    dom.loginForm.classList.remove("hidden");
    dom.adminPanel.classList.add("hidden");
  }
}

function switchTab(tab) {
  state.currentTab = tab;

  // Update tab buttons
  const isSimulasi = tab === "simulasi";
  dom.tabSimulasi.className = `pb-1 transition ${
    isSimulasi
      ? "text-emerald-400 border-b-2 border-emerald-400"
      : "text-slate-300 hover:text-white"
  }`;
  dom.tabAdmin.className = `pb-1 transition ${
    !isSimulasi
      ? "text-emerald-400 border-b-2 border-emerald-400"
      : "text-slate-300 hover:text-white"
  }`;

  // Show/hide tabs
  dom.simulasiTab.classList.toggle("hidden", !isSimulasi);
  dom.adminTab.classList.toggle("hidden", isSimulasi);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function initEventListeners() {
  // Tab switching
  dom.tabSimulasi.addEventListener("click", () => switchTab("simulasi"));
  dom.tabAdmin.addEventListener("click", () => switchTab("admin"));

  // Simulasi - motor select
  dom.selectMotor.addEventListener("change", () => {
    state.selectedMotor = state.listMotor[parseInt(dom.selectMotor.value)];
    hitungSimulasi();
  });

  // Simulasi - BBM select
  dom.selectBbm.addEventListener("change", () => {
    state.selectedBbm = state.listBbm[parseInt(dom.selectBbm.value)];
    hitungSimulasi();
  });

  // Simulasi - radio buttons
  document.querySelectorAll('input[name="tipeInput"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      state.tipeInput = radio.value;
      dom.inputUser.value = "";
      dom.inputUser.placeholder =
        state.tipeInput === "uang" ? "Contoh: 30000" : "Contoh: 2";
      resetHasil();
    });
  });

  // Simulasi - input
  dom.inputUser.addEventListener("input", hitungSimulasi);

  // Login
  dom.loginBtn.addEventListener("click", handleLogin);
  dom.loginPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  dom.loginUsername.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  // Logout
  dom.logoutBtn.addEventListener("click", handleLogout);

  // Add Motor
  dom.tambahMotorBtn.addEventListener("click", tambahMotor);

  // Add BBM
  dom.tambahBbmBtn.addEventListener("click", tambahBbm);

  // Update BBM
  dom.bbmToUpdate.addEventListener("change", isiFormUpdateBbm);
  dom.updateBbmBtn.addEventListener("click", updateDataBbm);

  // Update Motor
  dom.motorToUpdate.addEventListener("change", isiFormUpdateMotor);
  dom.updateMotorBtn.addEventListener("click", updateDataMotor);
}

// ============================================================
// INIT
// ============================================================
function init() {
  // Store original button texts for loading state
  document.querySelectorAll("button").forEach((btn) => {
    btn.dataset.originalText = btn.textContent;
  });

  initEventListeners();
  renderAdminView();
  loadDataAwal();
}

document.addEventListener("DOMContentLoaded", init);
