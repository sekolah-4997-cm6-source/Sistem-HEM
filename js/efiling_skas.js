// js/efiling_skas.js
import { db } from "./firebase-config.js";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Masukkan Web App URL dari Google Apps Script anda di sini
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxA5jjmir-WVsTEcZvZERMQJ8SmfhLHLYREUJuvbpm7qAFC9G1QmfmVV_WdoA8MEkN6QA/exec";

document.addEventListener("DOMContentLoaded", () => {
  const folderCards = document.querySelectorAll(".folder-card");
  const tajukFolder = document.getElementById("tajuk-folder-aktif");
  const jadualFailBody = document.getElementById("jadual-fail-body");
  const searchFail = document.getElementById("search-fail");

  const btnMuatNaik = document.getElementById("btn-muat-naik");
  const btnTutupUpload = document.getElementById("btn-tutup-upload");
  const modalUpload = document.getElementById("modal-upload");
  const formUpload = document.getElementById("form-upload-evidens");

  let standardAktif = "S1";
  let senaraiFail = [];

  const tajukStandardMap = {
    "S1": "Standard 1 (Kepimpinan)",
    "S2": "Standard 2 (Pengurusan Organisasi)",
    "S3": "Standard 3 (Kurikulum, Koku & HEM)",
    "S4": "Standard 4 (PdPC Guru)"
  };

  // 1. Tetapan Sasaran Tracker (Ubah nilai sasaran dokumen ikut sekolah anda)
  const sasaranDokumen = {
    "S1": 10, 
    "S2": 15,
    "S3": 20,
    "S4": 12
  };

  // Helper: Tukar Fail ke Base64
  const fileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  // ==========================================
  // FUNGSI A: TRACKER DOKUMEN REAL-TIME
  // ==========================================
  function langganStatistikFolders() {
    const qSemua = collection(db, "efiling");
    
    onSnapshot(qSemua, (snapshot) => {
      const kiraan = { "S1": 0, "S2": 0, "S3": 0, "S4": 0 };

      // Kira jumlah dokumen
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (kiraan[data.standard] !== undefined) {
          kiraan[data.standard]++;
        }
      });

      // Update UI untuk setiap kad
      folderCards.forEach(card => {
        const std = card.getAttribute("data-standard");
        const jumlahSediaAda = kiraan[std];
        const sasaran = sasaranDokumen[std];
        
        let peratus = Math.round((jumlahSediaAda / sasaran) * 100);
        if (peratus > 100) peratus = 100; 

        const textKiraan = card.querySelector(".tracker-kiraan");
        const textPeratus = card.querySelector(".tracker-peratus");

        if (textKiraan) textKiraan.textContent = `${jumlahSediaAda} Dokumen`;

        if (textPeratus) {
          textPeratus.textContent = `${peratus}% Lengkap`;
          textPeratus.className = "tracker-peratus font-bold"; // Reset kelas warna

          if (peratus >= 80) {
            textPeratus.classList.add("text-emerald-600");
          } else if (peratus >= 50) {
            textPeratus.classList.add("text-amber-500");
          } else {
            textPeratus.classList.add("text-red-500");
          }
        }
      });
    });
  }

  // ==========================================
  // FUNGSI B: PAPARAN JADUAL MENGIKUT STANDARD
  // ==========================================
  function langganFail(standard) {
    const q = query(collection(db, "efiling"), where("standard", "==", standard));
    onSnapshot(q, (snapshot) => {
      senaraiFail = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      renderJadualFail();
    });
  }

  function renderJadualFail() {
    jadualFailBody.innerHTML = "";
    const keyword = searchFail ? searchFail.value.toLowerCase() : "";
    const failTapis = senaraiFail.filter(f => f.nama.toLowerCase().includes(keyword));

    if (failTapis.length === 0) {
      jadualFailBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500 text-xs">Tiada fail eviden disimpan dalam folder ini.</td></tr>`;
      return;
    }

    failTapis.forEach((fail) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
      tr.innerHTML = `
        <td class="p-3 font-semibold text-slate-800 flex items-center space-x-2">
          <i class="fa-solid fa-file-pdf text-red-500 text-sm"></i>
          <span>${fail.nama}</span>
        </td>
        <td class="p-3"><span class="bg-slate-100 font-bold text-slate-600 px-2 py-0.5 rounded text-[10px]">${fail.standard}</span></td>
        <td class="p-3 text-slate-500 text-[11px]">${fail.tarikh}</td>
        <td class="p-3 text-slate-500 text-[11px]">${fail.saiz}</td>
        <td class="p-3 text-center space-x-2">
          <a href="${fail.fileUrl}" target="_blank" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-[10px] font-semibold transition inline-block" title="Buka di Drive">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <button data-id="${fail.id}" class="btn-padam-fail bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-[10px] font-semibold transition" title="Padam Rekod">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      jadualFailBody.appendChild(tr);
    });

    // Padam Rekod
    document.querySelectorAll(".btn-padam-fail").forEach(btn => {
      btn.addEventListener("click", async () => {
        const docId = btn.getAttribute("data-id");
        if (confirm("Adakah anda pasti mahu memadam rekod fail ini dari sistem?")) {
          await deleteDoc(doc(db, "efiling", docId));
          // Nota: Ia padam dari Firestore sahaja. Dari Google Drive perlu manual.
        }
      });
    });
  }
  
  // ==========================================
  // FUNGSI C: INTERAKSI UI (KLIK FOLDER, MODAL)
  // ==========================================
  if (folderCards.length > 0) {
    folderCards.forEach(card => {
      card.addEventListener("click", () => {
        standardAktif = card.getAttribute("data-standard");
        
        // Buat highlight visual pada folder yang diklik
        folderCards.forEach(c => c.classList.remove("ring-2", "ring-amber-500"));
        card.classList.add("ring-2", "ring-amber-500");

        if (tajukFolder) {
          tajukFolder.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500 mr-2"></i> Senarai Fail: ${tajukStandardMap[standardAktif]}`;
        }
        langganFail(standardAktif);
      });
    });
  }

  if (btnMuatNaik && modalUpload) {
    btnMuatNaik.addEventListener("click", () => modalUpload.classList.remove("hidden"));
  }

  if (btnTutupUpload && modalUpload) {
    btnTutupUpload.addEventListener("click", (e) => {
      e.preventDefault();
      modalUpload.classList.add("hidden");
    });
  }

  // ==========================================
  // FUNGSI D: HANTAR KE GOOGLE DRIVE (GAS) & FIRESTORE
  // ==========================================
  if (formUpload) {
    formUpload.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nama = document.getElementById("upload-nama").value;
      const std = document.getElementById("upload-standard").value;
      const fileInput = document.getElementById("upload-file");
      const file = fileInput.files[0];

      if (!file) return;

      const btnSubmit = formUpload.querySelector("button[type='submit']");
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Memuat naik...';

      try {
        const base64Data = await fileToBase64(file);

        // Tembak Data ke Google Apps Script
        const response = await fetch(GAS_WEB_APP_URL, {
          method: "POST",
          body: JSON.stringify({
            base64: base64Data,
            mimeType: file.type,
            fileName: `${Date.now()}_${file.name}`,
            kategoriFolder: std // <-- Hantar Kategori Standard untuk buat folder
          })
        });

        const result = await response.json();

        if (result.status === "success") {
          // Jika Drive berjaya, simpan ke Firestore
          await addDoc(collection(db, "efiling"), {
            nama: nama,
            standard: std,
            tarikh: new Date().toISOString().split('T')[0],
            saiz: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            fileUrl: result.fileUrl,
            driveFileId: result.fileId
          });

          formUpload.reset();
          modalUpload.classList.add("hidden");
          alert("Fail berjaya disimpan dalam Google Drive & Firestore!");
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("Ralat muat naik:", error);
        alert("Gagal memuat naik fail ke Google Drive. Sila semak sambungan/GAS URL.");
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Simpan ke e-Filing';
      }
    });
  }

  if (searchFail) {
    searchFail.addEventListener("input", renderJadualFail);
  }
  
  // ==========================================
  // INITIALIZATION
  // ==========================================
  langganStatistikFolders(); // 1. Mulakan tracker folder
  langganFail(standardAktif); // 2. Papar fail untuk folder pertama (S1)
});
