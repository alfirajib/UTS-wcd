const STORAGE_KEY_DRAFT = "bmw_booking_draft";
const STORAGE_KEY_LIST = "bmw_booking_list";

const form = document.getElementById("bookingForm");
const fields = ["nama", "email", "telepon", "varian", "tanggal", "pesan"];
const formStatus = document.getElementById("formStatus");
const bookingList = document.getElementById("bookingList");
const resetBtn = document.getElementById("resetForm");

function getInput(name) {
  return document.getElementById(name);
}

function showError(name, message) {
  const el = document.querySelector(`[data-error-for="${name}"]`);
  if (el) el.textContent = message;
}

function clearErrors() {
  fields.forEach((name) => showError(name, ""));
}

function validateForm() {
  clearErrors();
  let isValid = true;

  const nama = getInput("nama");
  if (!nama.value.trim()) {
    showError("nama", "Nama wajib diisi.");
    isValid = false;
  } else if (nama.value.trim().length < 3) {
    showError("nama", "Nama minimal 3 karakter.");
    isValid = false;
  }

  const email = getInput("email");
  if (!email.value.trim()) {
    showError("email", "Email wajib diisi.");
    isValid = false;
  } else if (!email.checkValidity()) {
    showError("email", "Format email tidak valid.");
    isValid = false;
  }

  const telepon = getInput("telepon");
  const teleponPattern = /^[0-9]{10,13}$/;
  if (!telepon.value.trim()) {
    showError("telepon", "Nomor telepon wajib diisi.");
    isValid = false;
  } else if (!teleponPattern.test(telepon.value.trim())) {
    showError("telepon", "Nomor telepon harus 10-13 digit angka.");
    isValid = false;
  }

  const varian = getInput("varian");
  if (!varian.value) {
    showError("varian", "Silakan pilih varian.");
    isValid = false;
  }

  const tanggal = getInput("tanggal");
  if (!tanggal.value) {
    showError("tanggal", "Tanggal test drive wajib diisi.");
    isValid = false;
  }

  return isValid;
}

function saveDraft() {
  const draft = {};
  fields.forEach((name) => {
    draft[name] = getInput(name).value;
  });
  localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
}

function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    fields.forEach((name) => {
      if (draft[name] !== undefined) {
        getInput(name).value = draft[name];
      }
    });
  } catch (e) {
    console.error("Gagal memuat draft:", e);
  }
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY_DRAFT);
}

function getBookings() {
  const raw = localStorage.getItem(STORAGE_KEY_LIST);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(bookings));
}

function renderBookings() {
  const bookings = getBookings();
  if (bookings.length === 0) {
    bookingList.innerHTML = "";
    return;
  }

  const rows = bookings
    .map(
      (b, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(b.nama)}</td>
        <td>${escapeHtml(b.email)}</td>
        <td>${escapeHtml(b.telepon)}</td>
        <td>${escapeHtml(b.varian)}</td>
        <td>${escapeHtml(b.tanggal)}</td>
      </tr>`,
    )
    .join("");

  bookingList.innerHTML = `
    <h3>Daftar Booking Tersimpan</h3>
    <table>
      <tr>
        <th>#</th>
        <th>Nama</th>
        <th>Email</th>
        <th>Telepon</th>
        <th>Varian</th>
        <th>Tanggal</th>
      </tr>
      ${rows}
    </table>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

fields.forEach((name) => {
  getInput(name).addEventListener("input", saveDraft);
});

// Submit form
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!validateForm()) {
    formStatus.textContent = "Silakan periksa kembali data yang dimasukkan.";
    formStatus.className = "form-status error";
    return;
  }

  const booking = {};
  fields.forEach((name) => {
    booking[name] = getInput(name).value.trim();
  });
  booking.submittedAt = new Date().toISOString();

  saveBooking(booking);
  renderBookings();

  formStatus.textContent =
    "Booking test drive berhasil dikirim! Data tersimpan.";
  formStatus.className = "form-status success";

  form.reset();
  clearDraft();
  clearErrors();
});

resetBtn.addEventListener("click", function () {
  form.reset();
  clearDraft();
  clearErrors();
  formStatus.textContent = "Draft form telah dihapus.";
  formStatus.className = "form-status";
});

window.addEventListener("DOMContentLoaded", function () {
  loadDraft();
  renderBookings();
});
