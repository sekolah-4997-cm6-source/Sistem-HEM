// js/efiling_skas.js
import { db, storage } from "./firebase_config.js";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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

  // Muat data fail mengikut Standard Folder yang dipilih
  function langganFail(standard) {
    const q = query(collection(db, "efiling"), where("standard", "==", standard));
    
    onSnapshot(q, (snapshot) => {
      senaraiFail = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      renderJadualFail();
    });
  }

  function renderJadualFail() {
    jadualFailBody.innerHTML = "";
    const keyword = searchFail.value.toLowerCase();

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
          <a href="${fail.fileUrl}" target="_blank" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-[10px] font-semibold transition inline-block" title="Buka / Muat Turun">
            <i class="fa-solid fa-download"></i>
          </a>
          <button data-id="${fail.id}" data-path="${fail.storagePath}" class="btn-padam-fail bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-[10px] font-semibold transition" title="Padam">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      jadualFailBody.appendChild(tr);
    });

    // Event Listener Padam Fail
    document.querySelectorAll(".btn-padam-fail").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const docId = btn.getAttribute("data-id");
        const storagePath = btn.getAttribute("data-path");
        if (confirm("Adakah anda pasti mahu memadam fail ini?")) {
          try {
            if (storagePath) await deleteObject(ref(storage, storagePath));
            await deleteDoc(doc(db, "efiling", docId));
            alert("Fail berjaya dipadam!");
          } catch (err) {
            console.error("Ralat memadam fail:", err);
          }
        }
      });
    });
  }

  // Tukar Folder Card
  folderCards.forEach(card => {
    card.addEventListener("click", () => {
      standardAktif = card.getAttribute("data-standard");
      tajukFolder.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500 mr-2"></i> Senarai Fail: ${tajukStandardMap[standardAktif]}`;
      langganFail(standardAktif);
    });
  });

  // Kawalan Modal
  btnMuatNaik.addEventListener("click", () => modalUpload.classList.remove("hidden"));
  btnTutupUpload.addEventListener("click", () => modalUpload.classList.add("hidden"));

  // Proses Muat Naik ke Storage + Firestore
  formUpload.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nama = document.getElementById("upload-nama").value;
    const std = document.getElementById("upload-standard").value;
    const fileInput = document.getElementById("upload-file");
    const file = fileInput.files[0];

    if (!file) return;

    const btnSubmit = formUpload.querySelector("button[type='submit']");
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Memuat naik...";

    try {
      // 1. Muat naik fizikal fail ke Firebase Storage
      const storagePath = `efiling/${std}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Simpan rekod metadata ke Firestore
      await addDoc(collection(db, "efiling"), {
        nama: nama,
        standard: std,
        tarikh: new Date().toISOString().split('T')[0],
        saiz: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileUrl: downloadURL,
        storagePath: storagePath
      });

      formUpload.reset();
      modalUpload.classList.add("hidden");
      alert("Evidens berjaya dimuat naik ke Firebase!");
    } catch (error) {
      console.error("Ralat muat naik:", error);
      alert("Gagal memuat naik fail. Sila cuba lagi.");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Simpan ke e-Filing";
    }
  });

  searchFail.addEventListener("input", renderJadualFail);

  // Mula membaca folder pertama (S1) semasa halaman dimuatkan
  langganFail(standardAktif);
});
