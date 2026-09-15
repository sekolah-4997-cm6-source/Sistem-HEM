// js/kehadiran.js

import { db } from "./firebase-config.js";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Format Tarikh Global (Contoh: "2026-09-15" untuk ID Firebase)
const hariIni = new Date();
const tarikhID = hariIni.toISOString().split('T')[0]; 

document.addEventListener("DOMContentLoaded", () => {
  initTarikh();
  initTabs();
  renderGridKelas();
});

// ==========================================
// 1. INIT TARIKH & PAPARAN
// ==========================================
function initTarikh() {
  const paparanTarikh = document.getElementById("paparan-tarikh");
  if (!paparanTarikh) return;

  // Format tarikh Bahasa Melayu (Contoh: "15 September 2026")
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  paparanTarikh.innerText = hariIni.toLocaleDateString('ms-MY', options);
}

// ==========================================
// 2. SISTEM NAVIGASI TAB
// ==========================================
function initTabs() {
  const tabs = ['analitik', 'kelas', 'individu'];

  tabs.forEach(tabAktif => {
    const btn = document.getElementById(`btn-tab-${tabAktif}`);
    if (!btn) return;

    btn.addEventListener('click', () => {
      tabs.forEach(tab => {
        // Urus paparan section (Sembunyi/Tunjuk)
        const section = document.getElementById(`tab-${tab}`);
        if (tab === tabAktif) {
          section.classList.remove('hidden');
          section.classList.add('block');
        } else {
          section.classList.remove('block');
          section.classList.add('hidden');
        }

        // Urus gaya butang (Aktif/Tidak Aktif)
        const currentBtn = document.getElementById(`btn-tab-${tab}`);
        if (tab === tabAktif) {
          currentBtn.classList.remove('text-slate-600', 'hover:bg-slate-50');
          currentBtn.classList.add('bg-slate-800', 'text-white');
        } else {
          currentBtn.classList.add('text-slate-600', 'hover:bg-slate-50');
          currentBtn.classList.remove('bg-slate-800', 'text-white');
        }
      });
    });
  });
}

// ==========================================
// 3. PENJANAAN GRID KELAS
// ==========================================
function renderGridKelas() {
  const container = document.getElementById("grid-kelas-container");
  if (!container) return;

  container.innerHTML = ""; // Kosongkan mesej "Memuatkan..."

  const senaraiTahun = [1, 2, 3, 4, 5, 6];
  const senaraiNamaKelas = ['Bestari', 'Bijak'];

  senaraiTahun.forEach(tahun => {
    senaraiNamaKelas.forEach(nama => {
      const namaPenuh = `${tahun} ${nama}`;
      
      // Cipta Kad HTML
      const card = document.createElement("div");
      // Gaya asas kad (Kelihatan kelabu tanda belum diisi)
      card.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-32 group";
      
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">${namaPenuh}</h3>
            <p class="text-xs text-slate-500 mt-1">Tahun ${tahun}</p>
          </div>
          <!-- Lencana Status (Default: Belum Diisi) -->
          <span id="badge-${tahun}-${nama}" class="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Belum Diisi
          </span>
        </div>
        <div class="mt-4 flex items-center text-xs font-semibold text-slate-400">
          <i class="fa-regular fa-hand-pointer mr-2"></i> Klik untuk isi
        </div>
      `;

      // Fungsi apabila kad kelas ditekan
      card.addEventListener("click", () => {
        bukaModalKehadiran(tahun, nama, namaPenuh);
      });

      container.appendChild(card);
    });
  });
}

// ==========================================
// 4. BUKA MODAL PENGISIAN KEHADIRAN (Persediaan)
// ==========================================
function bukaModalKehadiran(tahun, namaKelas, namaPenuh) {
  // Buat masa ini, kita keluarkan alert dahulu
  // Di fasa seterusnya, kita akan bina Modal (Pop-up) yang menarik senarai nama murid dari Firestore
  alert(`Membuka senarai murid untuk kelas ${namaPenuh}...\n(Fungsi pop-up akan dibina pada langkah seterusnya)`);
}
