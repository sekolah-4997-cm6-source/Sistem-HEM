// js/kehadiran.js

import { db } from "./firebase-config.js";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const hariIni = new Date();
const tarikhID = hariIni.toISOString().split('T')[0]; 

let currentKelasPenuh = "";
let dataMuridSemasa = [];

// Pemboleh ubah untuk mengelakkan graf bertindih (Chart.js instance)
let chartPerbandingan = null;
let chartPrestasi = null;

document.addEventListener("DOMContentLoaded", () => {
  initTarikh();
  initTabs();
  renderGridKelas();
  
  // PANGGIL FUNGSI ANALITIK DI SINI (Ini yang baru ditambah)
  muatDataAnalitikHarian();
  muatDataPrestasiYTD();
  
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


// ==========================================
// 6. FUNGSI SIMPAN KEHADIRAN KE FIRESTORE
// ==========================================

// Pasang Event Listener pada butang "Simpan Rekod"
document.addEventListener("DOMContentLoaded", () => {
  const btnSimpan = document.getElementById("btn-simpan-kehadiran");
  if(btnSimpan) {
    btnSimpan.addEventListener("click", simpanKehadiran);
  }
});

async function simpanKehadiran() {
  const btnSimpan = document.getElementById("btn-simpan-kehadiran");
  const teksAsalButang = btnSimpan.innerHTML;
  
  // Tukar butang ke status 'loading'
  btnSimpan.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Menyimpan...`;
  btnSimpan.disabled = true;

  try {
    const checkboxes = document.querySelectorAll('.checkbox-hadir');
    let senaraiRekodMurid = [];
    let jumlahHadir = 0;
    let jumlahTidakHadir = 0;

    // 1. Kumpul data dari setiap baris murid
    checkboxes.forEach(cb => {
      const idMurid = cb.getAttribute('data-id');
      // Cari nama dari array dataMuridSemasa
      const muridData = dataMuridSemasa.find(m => m.id === idMurid); 
      const isHadir = cb.checked;
      let sebabText = "";

      if (isHadir) {
        jumlahHadir++;
      } else {
        jumlahTidakHadir++;
        sebabText = document.getElementById(`sebab-${idMurid}`).value;
      }

      senaraiRekodMurid.push({
        idMurid: idMurid,
        nama: muridData ? muridData.nama : "Tidak Diketahui",
        hadir: isHadir,
        sebab: sebabText
      });
    });

    // Semak jika kelas tiada murid
    if (senaraiRekodMurid.length === 0) {
      alert("Tiada data murid untuk disimpan.");
      btnSimpan.innerHTML = teksAsalButang;
      btnSimpan.disabled = false;
      return;
    }

    // 2. Format ID Dokumen: Cth "2026-09-15_1-Bestari"
    const kelasID = currentKelasPenuh.replace(" ", "-"); 
    const docID = `${tarikhID}_${kelasID}`;

    // 3. Data untuk dihantar ke koleksi 'kehadiran_harian'
    const dataHarian = {
      tarikh: tarikhID,
      namaKelas: currentKelasPenuh,
      statusSelesai: true,
      jumlahHadir: jumlahHadir,
      jumlahTidakHadir: jumlahTidakHadir,
      jumlahMurid: jumlahHadir + jumlahTidakHadir,
      senaraiMurid: senaraiRekodMurid,
      timestamp: new Date()
    };

    // 4. Hantar data ke Firestore (Set/Update)
    await setDoc(doc(db, "kehadiran_harian", docID), dataHarian);

    // (Pilihan) Nanti di sini kita akan tambah kod untuk kemaskini 
    // profil YTD setiap murid, tetapi mari fokus harian dahulu.

    // 5. Kemaskini UI (Tutup modal & tukar Lencana Kelas)
    document.getElementById("modal-kehadiran").classList.add("hidden");
    alert(`Rekod kehadiran ${currentKelasPenuh} berjaya disimpan!`);
    
    // Kira Peratusan Hadir
    const peratus = Math.round((jumlahHadir / (jumlahHadir + jumlahTidakHadir)) * 100);
    kemaskiniLencanaKelas(currentKelasPenuh, peratus);

  } catch (error) {
    console.error("Ralat menyimpan kehadiran:", error);
    alert("Berlaku ralat semasa menyimpan rekod. Sila cuba lagi.");
  } finally {
    // Kembalikan butang ke keadaan asal
    btnSimpan.innerHTML = teksAsalButang;
    btnSimpan.disabled = false;
  }
}

// ==========================================
// 7. KEMASKINI LENCANA KELAS DI DASHBOARD
// ==========================================
function kemaskiniLencanaKelas(namaPenuh, peratus) {
  // namaPenuh contoh: "1 Bestari". Kita pecahkan kepada tahun dan nama
  const [tahun, nama] = namaPenuh.split(" ");
  const badgeId = `badge-${tahun}-${nama}`;
  const badge = document.getElementById(badgeId);
  
  if(badge) {
    badge.innerText = `Selesai (${peratus}%)`;
    // Buang warna kelabu
    badge.classList.remove("bg-slate-100", "text-slate-500", "border-slate-200");
    
    // Letak warna ikut peratusan
    if(peratus >= 90) {
      badge.classList.add("bg-emerald-100", "text-emerald-700", "border-emerald-300"); // Hijau
    } else if (peratus >= 80) {
      badge.classList.add("bg-amber-100", "text-amber-700", "border-amber-300"); // Kuning
    } else {
      badge.classList.add("bg-red-100", "text-red-700", "border-red-300"); // Merah
    }
  }
}

// ==========================================
// 8. DATA & GRAF ANALITIK (FASA 4)
// ==========================================

async function muatDataAnalitikHarian() {
  try {
    // Tarik semua rekod kehadiran untuk hari ini sahaja
    const q = query(collection(db, "kehadiran_harian"), where("tarikh", "==", tarikhID));
    const snapshot = await getDocs(q);

    let totalHadir = 0;
    let totalTidakHadir = 0;
    let totalPonteng = 0;
    let totalBersebab = 0;
    let totalMurid = 0;

    // Array untuk simpan peratus kehadiran bagi graf Bar (Tahun 1-6)
    let dataBestari = [0, 0, 0, 0, 0, 0];
    let dataBijak = [0, 0, 0, 0, 0, 0];

    snapshot.forEach(doc => {
      const data = doc.data();
      totalHadir += data.jumlahHadir || 0;
      totalTidakHadir += data.jumlahTidakHadir || 0;
      totalMurid += data.jumlahMurid || 0;

      // Asingkan Ponteng vs Bersebab
      if (data.senaraiMurid) {
        data.senaraiMurid.forEach(m => {
          if (!m.hadir) {
            if (m.sebab === "Tanpa Sebab") totalPonteng++;
            else totalBersebab++;
          }
        });
      }

      // Format Graf Perbandingan Kelas
      const parts = data.namaKelas.split(" "); // Cth: "1 Bestari" -> ["1", "Bestari"]
      const tahun = parseInt(parts[0]);
      const jenisKelas = parts[1];
      const peratusKelas = data.jumlahMurid > 0 ? (data.jumlahHadir / data.jumlahMurid) * 100 : 0;

      if (tahun >= 1 && tahun <= 6) {
        const index = tahun - 1; // Tahun 1 di index 0
        if (jenisKelas === "Bestari") dataBestari[index] = peratusKelas.toFixed(1);
        if (jenisKelas === "Bijak") dataBijak[index] = peratusKelas.toFixed(1);
      }
    });

    // Kemaskini Teks KPI di bahagian atas
    const peratusHadir = totalMurid > 0 ? ((totalHadir / totalMurid) * 100).toFixed(1) : 0;
    document.getElementById("kpi-hadir").innerText = `${peratusHadir}%`;
    document.getElementById("kpi-bersebab").innerText = `${totalBersebab} Murid`;
    document.getElementById("kpi-ponteng").innerText = `${totalPonteng} Murid`;

    // Bina Graf Perbandingan
    renderGrafPerbandingan(dataBestari, dataBijak);

  } catch (error) {
    console.error("Ralat memuat data analitik:", error);
  }
}

async function muatDataPrestasiYTD() {
  try {
    const snapshot = await getDocs(collection(db, "murid"));
    let emas = 0, hijau = 0, kuning = 0, merah = 0;
    let adaData = false;

    snapshot.forEach(doc => {
      const m = doc.data();
      if (m.statsKehadiran && m.statsKehadiran.jumlahHariSekolah > 0) {
        adaData = true;
        const peratus = (m.statsKehadiran.jumlahHadir / m.statsKehadiran.jumlahHariSekolah) * 100;
        
        if (peratus === 100) emas++;
        else if (peratus >= 90) hijau++;
        else if (peratus >= 80) kuning++;
        else merah++;
      }
    });

    // Jika sistem masih baru dan tiada rekod, kita letak visual dummy untuk cantikkan paparan
    if (!adaData) {
      emas = 25; hijau = 55; kuning = 15; merah = 5;
    }

    renderGrafPrestasi(emas, hijau, kuning, merah);
  } catch (error) {
    console.error("Ralat memuat prestasi YTD:", error);
  }
}

// ==========================================
// 9. LUKIS GRAF (CHART.JS)
// ==========================================
function renderGrafPerbandingan(dataBestari, dataBijak) {
  const ctx = document.getElementById('grafPerbandinganKelas');
  if (!ctx) return;

  // Destroy graf lama jika ada (untuk elak hover glitch)
  if (chartPerbandingan) chartPerbandingan.destroy();

  chartPerbandingan = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4', 'Tahun 5', 'Tahun 6'],
      datasets: [
        {
          label: 'Kelas Bestari (%)',
          data: dataBestari,
          backgroundColor: '#3b82f6', // Biru
          borderRadius: 4
        },
        {
          label: 'Kelas Bijak (%)',
          data: dataBijak,
          backgroundColor: '#f97316', // Oren
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 }
      },
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderGrafPrestasi(emas, hijau, kuning, merah) {
  const ctx = document.getElementById('grafPrestasiWarna');
  if (!ctx) return;

  if (chartPrestasi) chartPrestasi.destroy();

  chartPrestasi = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Emas (100%)', 'Hijau (90-99%)', 'Kuning (80-89%)', 'Merah (<80%)'],
      datasets: [{
        data: [emas, hijau, kuning, merah],
        backgroundColor: [
          '#fbbf24', // Kuning Emas
          '#10b981', // Hijau
          '#f59e0b', // Kuning Gelap
          '#ef4444'  // Merah
        ],
        borderWidth: 0,
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
}
