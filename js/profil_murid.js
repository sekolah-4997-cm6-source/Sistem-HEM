// js/profil_murid.js
import { db } from "./firebase-config.js";
import { collection, addDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  // --- 1. DOM Elements ---
  const pendapatanInput = document.getElementById("pendapatan-bulanan");
  const tanggunganInput = document.getElementById("bilangan-tanggungan");
  const perkapitaDisplay = document.getElementById("gaji-perkapita-display");
  const checkboxes = document.querySelectorAll(".doc-checkbox");
  const statusBadge = document.getElementById("status-dokumen-badge");
  const form = document.getElementById("profil-murid-form");
  const headerTitle = document.querySelector("header h1"); // Untuk tukar tajuk
  
  // Ambil ID dari URL jika ada (Cth: profil_murid.html?id=123ABCxyz)
  const urlParams = new URLSearchParams(window.location.search);
  const muridId = urlParams.get("id");

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
    if (jumlahChecked === checkboxes.length) {
      statusBadge.innerHTML = "🟢 Dokumen Lengkap";
      statusBadge.className = "px-2.5 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-700";
    } else {
      statusBadge.innerHTML = "🔴 Dokumen Tidak Lengkap";
      statusBadge.className = "px-2.5 py-1 text-xs font-bold rounded bg-red-100 text-red-700";
    }
  }

  checkboxes.forEach(chk => chk.addEventListener("change", semakStatusDokumen));

  // ==========================================
  // FUNGSI 3: SEMAK JIKA MOD 'KEMAS KINI' (EDIT)
  // ==========================================
  if (muridId) {
    headerTitle.innerHTML = "Kemas Kini Profil Murid";
    document.getElementById("btn-simpan-profil").innerHTML = '<i class="fa-solid fa-floppy-disk mr-1"></i> Kemas Kini Profil';
    
    try {
      const docRef = doc(db, "murid", muridId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Masukkan data ke dalam input borang
        document.getElementById("nama-murid").value = data.nama || "";
        document.getElementById("no-mykid").value = data.mykid || "";
        document.getElementById("kelas-id").value = data.kelas || "";
        document.getElementById("jantina").value = data.jantina || "L";
        document.getElementById("alahan").value = data.kesihatan === "Tiada" ? "" : (data.kesihatan || "");
        document.getElementById("nama-penjaga").value = data.waris || "";
        document.getElementById("no-telefon").value = data.telWaris || "";
        document.getElementById("no-telefon-kecemasan").value = data.telWaris2 || "";
        document.getElementById("alamat-lengkap").value = data.alamat || "";
        document.getElementById("pendapatan-bulanan").value = data.pendapatan || "";
        document.getElementById("bilangan-tanggungan").value = data.tanggungan || 1;
        
        // Simulasikan kotak semak jika dokumen sebelum ini lengkap
        if (data.dokumenLengkap) {
          checkboxes.forEach(chk => chk.checked = true);
        }

        // Jalankan pengiraan semula supaya UI nampak kemas
        kiraGajiPerkapita();
        semakStatusDokumen();
      } else {
        alert("Data murid tidak dijumpai!");
        window.location.href = "senarai_murid.html";
      }
    } catch (error) {
      console.error("Ralat mengambil data:", error);
    }
  }

  // ==========================================
  // FUNGSI 4: KAWALAN HANTAR BORANG (SUBMIT)
  // ==========================================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); 
      
      const btnSimpan = document.getElementById("btn-simpan-profil");
      const teksAsalBtn = btnSimpan.innerHTML;
      btnSimpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
      btnSimpan.disabled = true;

      try {
        const pendapatan = parseFloat(pendapatanInput.value) || 0;
        const tanggungan = parseInt(tanggunganInput.value) || 1;
        const perkapita = pendapatan / tanggungan;
        const jumlahChecked = document.querySelectorAll(".doc-checkbox:checked").length;
        const isDokumenLengkap = jumlahChecked === checkboxes.length;

        const dataMurid = {
          nama: document.getElementById("nama-murid").value.toUpperCase(),
          mykid: document.getElementById("no-mykid").value,
          kelas: document.getElementById("kelas-id").value,
          jantina: document.getElementById("jantina").value,
          kesihatan: document.getElementById("alahan").value || "Tiada",
          waris: document.getElementById("nama-penjaga").value.toUpperCase(),
          telWaris: document.getElementById("no-telefon").value,
          telWaris2: document.getElementById("no-telefon-kecemasan").value || "",
          alamat: document.getElementById("alamat-lengkap").value,
          pendapatan: pendapatan,
          tanggungan: tanggungan,
          perkapita: perkapita,
          dokumenLengkap: isDokumenLengkap,
          // tarikhDaftar: Jangan timpa tarikh daftar jika edit
        };

        if (muridId) {
          // MOD KEMAS KINI: Gunakan updateDoc
          dataMurid.tarikhKemaskini = new Date().toISOString();
          const docRef = doc(db, "murid", muridId);
          await updateDoc(docRef, dataMurid);
          alert(`Maklumat ${dataMurid.nama} BERJAYA dikemas kini!`);
        } else {
          // MOD DAFTAR BARU: Gunakan addDoc
          dataMurid.tarikhDaftar = new Date().toISOString();
          await addDoc(collection(db, "murid"), dataMurid);
          alert(`Rekod profil ${dataMurid.nama} BERJAYA didaftarkan!`);
        }

        window.location.href = "senarai_murid.html";

      } catch (error) {
        console.error("Ralat menyimpan data: ", error);
        alert("Gagal menyimpan data ke pangkalan data.");
      } finally {
        btnSimpan.innerHTML = teksAsalBtn;
        btnSimpan.disabled = false;
      }
    });
  }
});
