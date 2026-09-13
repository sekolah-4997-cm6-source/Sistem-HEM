// js/profil_murid.js
import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
    const tanggungan = parseInt(tanggunganInput.value) || 1; 
    const perkapita = pendapatan / tanggungan;

    perkapitaDisplay.textContent = `RM ${perkapita.toFixed(2)}`;

    if (perkapita > 0 && perkapita <= 310) {
      perkapitaDisplay.className = "w-full p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg font-bold text-emerald-700";
    } else {
      perkapitaDisplay.className = "w-full p-2.5 bg-slate-200 border border-slate-300 rounded-lg font-bold text-slate-800";
    }
  }

  pendapatanInput.addEventListener("input", kiraGajiPerkapita);
  tanggunganInput.addEventListener("input", kiraGajiPerkapita);

  // ==========================================
  // FUNGSI 2: SEMAK STATUS LAMPIRAN DOKUMEN
  // ==========================================
  function semakStatusDokumen() {
    const jumlahChecked = document.querySelectorAll(".doc-checkbox:checked").length;
    const jumlahTotal = checkboxes.length;

    if (jumlahChecked === jumlahTotal) {
      statusBadge.innerHTML = "🟢 Dokumen Lengkap";
      statusBadge.className = "px-2.5 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-700";
    } else {
      statusBadge.innerHTML = "🔴 Dokumen Tidak Lengkap";
      statusBadge.className = "px-2.5 py-1 text-xs font-bold rounded bg-red-100 text-red-700";
    }
  }

  checkboxes.forEach(chk => chk.addEventListener("change", semakStatusDokumen));

  // ==========================================
  // FUNGSI 3: KAWALAN HANTAR BORANG (SUBMIT KE FIREBASE)
  // ==========================================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); 
      
      const btnSimpan = document.getElementById("btn-simpan-profil");
      const teksAsalBtn = btnSimpan.innerHTML;
      btnSimpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
      btnSimpan.disabled = true;

      try {
        // Kumpul semua data dari borang
        const pendapatan = parseFloat(pendapatanInput.value) || 0;
        const tanggungan = parseInt(tanggunganInput.value) || 1;
        const perkapita = pendapatan / tanggungan;
        
        // Semak jika dokumen lengkap
        const jumlahChecked = document.querySelectorAll(".doc-checkbox:checked").length;
        const isDokumenLengkap = jumlahChecked === checkboxes.length;

        // Sediakan objek data untuk dihantar ke Firestore
        const dataMurid = {
          nama: document.getElementById("nama-murid").value.toUpperCase(),
          mykid: document.getElementById("no-mykid").value,
          kelas: document.getElementById("kelas-id").value,
          jantina: document.getElementById("jantina").value,
          kesihatan: document.getElementById("alahan").value || "Tiada",
          waris: document.getElementById("nama-penjaga").value.toUpperCase(),
          telWaris: document.getElementById("no-telefon").value,
          waris2: "", // Boleh ditambah kemudian jika ada
          telWaris2: document.getElementById("no-telefon-kecemasan").value || "",
          alamat: document.getElementById("alamat-lengkap").value,
          pendapatan: pendapatan,
          tanggungan: tanggungan,
          perkapita: perkapita,
          dokumenLengkap: isDokumenLengkap,
          tarikhDaftar: new Date().toISOString()
        };

        // Simpan ke collection 'murid' di Firestore
        await addDoc(collection(db, "murid"), dataMurid);

        alert(`Rekod untuk profil murid:\n${dataMurid.nama}\nTelah BERJAYA disimpan ke pangkalan data!`);
        window.location.href = "senarai_murid.html";

      } catch (error) {
        console.error("Ralat menyimpan data: ", error);
        alert("Gagal menyimpan data ke pangkalan data. Sila semak sambungan internet atau tetapan Firebase Rules anda.");
      } finally {
        // Kembalikan butang kepada keadaan asal jika gagal
        btnSimpan.innerHTML = teksAsalBtn;
        btnSimpan.disabled = false;
      }
    });
  }
});
