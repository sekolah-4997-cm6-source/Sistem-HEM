// js/kehadiran.js

import { db } from "./firebase-config.js";
// Tambah import query dan where
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const hariIni = new Date();
const tarikhID = hariIni.toISOString().split('T')[0]; 

// Variabel Global untuk Modal
let currentKelasPenuh = "";
let dataMuridSemasa = [];

document.addEventListener("DOMContentLoaded", () => {
  initTarikh();
  initTabs();
  renderGridKelas();
  
  // Fungsi tutup modal
  const btnTutup = document.getElementById("btn-tutup-modal");
  if(btnTutup) {
    btnTutup.addEventListener("click", () => {
      document.getElementById("modal-kehadiran").classList.add("hidden");
    });
  }
});

// ==========================================
// 1 & 2. INIT TARIKH & TABS (Kekal sama)
// ==========================================
function initTarikh() {
  const paparanTarikh = document.getElementById("paparan-tarikh");
  if (!paparanTarikh) return;
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  paparanTarikh.innerText = hariIni.toLocaleDateString('ms-MY', options);
}

function initTabs() {
  const tabs = ['analitik', 'kelas', 'individu'];
  tabs.forEach(tabAktif => {
    const btn = document.getElementById(`btn-tab-${tabAktif}`);
    if (!btn) return;
    btn.addEventListener('click', () => {
      tabs.forEach(tab => {
        const section = document.getElementById(`tab-${tab}`);
        const currentBtn = document.getElementById(`btn-tab-${tab}`);
        if (tab === tabAktif) {
          section.classList.remove('hidden'); section.classList.add('block');
          currentBtn.classList.remove('text-slate-600', 'hover:bg-slate-50');
          currentBtn.classList.add('bg-slate-800', 'text-white');
        } else {
          section.classList.remove('block'); section.classList.add('hidden');
          currentBtn.classList.add('text-slate-600', 'hover:bg-slate-50');
          currentBtn.classList.remove('bg-slate-800', 'text-white');
        }
      });
    });
  });
}

// ==========================================
// 3. PENJANAAN GRID KELAS (Kekal sama)
// ==========================================
function renderGridKelas() {
  const container = document.getElementById("grid-kelas-container");
  if (!container) return;
  container.innerHTML = ""; 

  const senaraiTahun = [1, 2, 3, 4, 5, 6];
  const senaraiNamaKelas = ['Bestari', 'Bijak'];

  senaraiTahun.forEach(tahun => {
    senaraiNamaKelas.forEach(nama => {
      const namaPenuh = `${tahun} ${nama}`;
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between h-32 group";
      
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">${namaPenuh}</h3>
            <p class="text-xs text-slate-500 mt-1">Tahun ${tahun}</p>
          </div>
          <span id="badge-${tahun}-${nama}" class="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Belum Diisi
          </span>
        </div>
        <div class="mt-4 flex items-center text-xs font-semibold text-slate-400 group-hover:text-blue-500 transition-colors">
          <i class="fa-regular fa-hand-pointer mr-2"></i> Klik untuk isi
        </div>
      `;

      card.addEventListener("click", () => bukaModalKehadiran(tahun, nama, namaPenuh));
      container.appendChild(card);
    });
  });
}

// ==========================================
// 4. BUKA MODAL & TARIK DATA MURID DARI FIRESTORE
// ==========================================
async function bukaModalKehadiran(tahun, namaKelas, namaPenuh) {
  currentKelasPenuh = namaPenuh;
  const modal = document.getElementById("modal-kehadiran");
  const tbody = document.getElementById("modal-senarai-murid");
  
  // Set Tajuk
  document.getElementById("modal-tajuk").innerText = `Kehadiran: ${namaPenuh}`;
  document.getElementById("modal-tarikh").innerText = `Tarikh: ${hariIni.toLocaleDateString('ms-MY')}`;
  
  // Paparkan modal & status memuatkan
  modal.classList.remove("hidden");
  tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center"><i class="fa-solid fa-spinner fa-spin text-blue-500 text-2xl mb-3"></i><br>Memuatkan senarai murid dari pangkalan data...</td></tr>`;
  
  try {
    // Tarik murid dari koleksi 'murid' yang mana kelas == "1 Bestari" dll
    const q = query(collection(db, "murid"), where("kelas", "==", namaPenuh));
    const snapshot = await getDocs(q);
    
    dataMuridSemasa = [];
    snapshot.forEach(doc => {
      dataMuridSemasa.push({ id: doc.id, ...doc.data() });
    });
    
    // Susun nama ikut abjad
    dataMuridSemasa.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
    
    renderSenaraiMuridModal();

  } catch (error) {
    console.error("Ralat menarik data murid:", error);
    tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Gagal memuatkan data. Sila pastikan sambungan internet stabil.</td></tr>`;
  }
}

// ==========================================
// 5. PAPARKAN SENARAI MURID DALAM MODAL
// ==========================================
function renderSenaraiMuridModal() {
  const tbody = document.getElementById("modal-senarai-murid");
  tbody.innerHTML = "";
  
  // Jika tiada murid dalam kelas tersebut
  if(dataMuridSemasa.length === 0) {
     tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-500">Tiada murid direkodkan dalam kelas ini.</td></tr>`;
     kemaskiniKiraanSemasa();
     return;
  }
  
  // Loop data murid & bina HTML (Baris Jadual)
  dataMuridSemasa.forEach((murid, index) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-blue-50 transition-colors bg-white";
    
    tr.innerHTML = `
      <td class="p-3 pl-4 text-slate-400 font-bold">${index + 1}</td>
      <td class="p-3 font-semibold text-slate-800">${murid.nama || "Tiada Nama"}</td>
      <td class="p-3 text-center">
        <!-- Toggle Button iOS Style -->
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" class="sr-only peer checkbox-hadir" data-id="${murid.id}" checked>
          <div class="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
        </label>
      </td>
      <td class="p-3 pr-4">
        <!-- Dropdown Sebab (Tersembunyi jika Hadir) -->
        <select class="select-sebab hidden w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" id="sebab-${murid.id}">
          <option value="Tanpa Sebab">Tanpa Sebab (Ponteng)</option>
          <option value="Sakit">Sakit (Cuti Sakit / Surat)</option>
          <option value="Urusan Keluarga">Urusan Keluarga</option>
          <option value="Wakili Sekolah">Wakili Sekolah (Dikira Hadir)</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Pasang Event Listener pada setiap butang toggle
  const checkboxes = tbody.querySelectorAll('.checkbox-hadir');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const selectSebab = document.getElementById(`sebab-${id}`);
      
      // Tunjuk/Sembunyi dropdown sebab berdasarkan toggle
      if(e.target.checked) {
        selectSebab.classList.add('hidden');
      } else {
        selectSebab.classList.remove('hidden');
      }
      kemaskiniKiraanSemasa(); // Kemaskini kiraan di bawah modal
    });
  });
  
  kemaskiniKiraanSemasa();
}

function kemaskiniKiraanSemasa() {
  const checkboxes = document.querySelectorAll('.checkbox-hadir');
  let hadir = 0;
  let takHadir = 0;
  
  checkboxes.forEach(cb => {
    if(cb.checked) hadir++;
    else takHadir++;
  });
  
  document.getElementById('kiraan-hadir').innerText = `Hadir: ${hadir}`;
  document.getElementById('kiraan-tak-hadir').innerText = `Tidak Hadir: ${takHadir}`;
}
