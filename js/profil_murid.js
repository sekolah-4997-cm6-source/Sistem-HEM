// js/profil_murid.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. DOM Elements untuk Pengiraan Gaji Perkapita ---
  const pendapatanInput = document.getElementById("pendapatan-bulanan");
  const tanggunganInput = document.getElementById("bilangan-tanggungan");
  const perkapitaDisplay = document.getElementById("gaji-perkapita-display");

  // --- 2. DOM Elements untuk Senarai Semak Dokumen ---
  const checkboxes = document.querySelectorAll(".doc-checkbox");
  const statusBadge = document.getElementById("status-dokumen-badge");

  // --- 3. DOM Elements untuk Borang ---
  const form = document.getElementById("profil-murid-form");

  // ==========================================
  // FUNGSI 1: KIRA GAJI PERKAPITA (AUTO)
  // ==========================================
  function kiraGajiPerkapita() {
    const pendapatan = parseFloat(pendapatanInput.value) || 0;
    // Pastikan minimum tanggungan adalah 1 untuk mengelakkan ralat bahagi dengan sifar
    const tanggungan = parseInt(tanggunganInput.value) || 1; 

    const perkapita = pendapatan / tanggungan;

    // Paparkan format RM
    perkapitaDisplay.textContent = `RM ${perkapita.toFixed(2)}`;

    // Logik Tambahan: Jika perkapita <= RM310 (Kadar Kelayakan RMT/BAP), tukar warna amaran hijau
    if (perkapita > 0 && perkapita <= 310) {
      perkapitaDisplay.className = "w-full p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg font-bold text-emerald-700";
    } else {
      // Kembali kepada warna asal
      perkapitaDisplay.className = "w-full p-2.5 bg-slate-200 border border-slate-300 rounded-lg font-bold text-slate-800";
    }
  }

  // Pasang Event Listener (Apabila pengguna menaip/mengubah nilai)
  pendapatanInput.addEventListener("input", kiraGajiPerkapita);
  tanggunganInput.addEventListener("input", kiraGajiPerkapita);

  // ==========================================
  // FUNGSI 2: SEMAK STATUS LAMPIRAN DOKUMEN
  // ==========================================
  function semakStatusDokumen() {
    // Kira berapa kotak yang telah ditanda (checked)
    const jumlahChecked = document.querySelectorAll(".doc-checkbox:checked").length;
    const jumlahTotal = checkboxes.length;

    if (jumlahChecked === jumlahTotal) {
      // Jika semua 4 ditanda, tukar kepada Lengkap (Hijau)
      statusBadge.innerHTML = "🟢 Dokumen Lengkap";
      statusBadge.className = "px-2.5 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-700";
    } else {
      // Jika tidak cukup 4, kekal Tidak Lengkap (Merah)
      statusBadge.innerHTML = "🔴 Dokumen Tidak Lengkap";
      statusBadge.className = "px-2.5 py-1 text-xs font-bold rounded bg-red-100 text-red-700";
    }
  }

  // Pasang Event Listener untuk setiap kotak semak
  checkboxes.forEach(chk => {
    chk.addEventListener("change", semakStatusDokumen);
  });

  // ==========================================
  // FUNGSI 3: KAWALAN HANTAR BORANG (SUBMIT)
  // ==========================================
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // Halang page dari refresh secara automatik

      const namaMurid = document.getElementById("nama-murid").value.toUpperCase();
      
      // Di sini nanti anda boleh pautkan dengan API/Database (seperti Firebase/MySQL)
      // Buat masa ini kita paparkan notifikasi sukses
      alert(`Rekod untuk profil murid:\n${namaMurid}\nTelah berjaya disimpan ke dalam sistem!`);

      // Selepas berjaya, bawa pengguna kembali ke halaman senarai murid
      window.location.href = "senarai_murid.html";
    });
  }
});
