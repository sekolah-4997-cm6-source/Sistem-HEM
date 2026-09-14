// js/admin.js

import { db } from "./firebase-config.js";
import { collection, getDocs, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let enrolmenChartInstance = null; // Simpan instance graf supaya boleh dikemaskini

document.addEventListener("DOMContentLoaded", () => {
  initGlobalSearch(); // Panggil fungsi carian apabila halaman dimuatkan[cite: 9]
  initStaticCharts(); // Papar graf kehadiran bulanan (statik buat masa ini)
  muatDataDashboard(); // Panggil fungsi tarik data dinamik
});

// ==========================================
// 1. MUAT DATA PAPAN PEMUKA (DINAMIK)
// ==========================================
async function muatDataDashboard() {
  try {
    // 1. Tarik Data Murid untuk Enrolmen & B40
    const muridSnap = await getDocs(collection(db, "murid"));
    let totalLelaki = 0;
    let totalPerempuan = 0;
    let totalB40 = 0;

    muridSnap.forEach((doc) => {
      const data = doc.data();
      
      // Kira Jantina (Boleh disesuaikan jika medan anda 'L' atau 'Lelaki')
      if (data.jantina === 'L' || data.jantina === 'Lelaki') {
        totalLelaki++;
      } else if (data.jantina === 'P' || data.jantina === 'Perempuan') {
        totalPerempuan++;
      }

      // Kira B40/RMT (Anggapan: ada field layakRMT = true atau pendapatan < 1169)
      if (data.layakRmt === true || data.layakRMT === true || data.pendapatan <= 1169) {
        totalB40++;
      }
    });

    const totalMurid = totalLelaki + totalPerempuan;

    // Kemaskini Kad Metrik Enrolmen & RMT
    const kpiEnrolmen = document.getElementById("kpi-enrolmen");
    if (kpiEnrolmen) kpiEnrolmen.innerHTML = `${totalMurid} <span class="text-xs font-normal text-slate-500">(${totalLelaki}L / ${totalPerempuan}P)</span>`;

    const kpiRmt = document.getElementById("kpi-rmt");
    if (kpiRmt) kpiRmt.innerHTML = `${totalB40} <span class="text-xs font-normal text-slate-500">Layak RMT</span>`;

    // Kemaskini Graf Donut Enrolmen
    renderEnrolmenChart(totalLelaki, totalPerempuan);

    // 2. Tarik Data Disiplin (Real-time untuk pantau kes aktif)
    const qDisiplin = query(collection(db, "disiplin"), where("status", "==", "Belum Selesai"));
    onSnapshot(qDisiplin, (snapshot) => {
      const jumlahKes = snapshot.size;
      const kpiDisiplin = document.getElementById("kpi-disiplin");
      if (kpiDisiplin) kpiDisiplin.innerText = `${jumlahKes} Kes`;
    });

  } catch (error) {
    console.error("Ralat memuat data papan pemuka:", error);
  }
}

// ==========================================
// 2. FUNGSI GRAF & CARTA 
// ==========================================
function renderEnrolmenChart(lelaki, perempuan) {
  const ctxEnrolmen = document.getElementById("enrolmenChart");
  if (!ctxEnrolmen) return;

  // Hapus graf lama jika ada untuk elak pertindihan
  if (enrolmenChartInstance) {
    enrolmenChartInstance.destroy();
  }

  enrolmenChartInstance = new Chart(ctxEnrolmen, {
    type: "doughnut",
    data: {
      labels: [`Lelaki (${lelaki})`, `Perempuan (${perempuan})`], // Label dinamik[cite: 9]
      datasets: [{
        data: [lelaki, perempuan], // Data dinamik dari Firestore[cite: 9]
        backgroundColor: ["#3b82f6", "#ec4899"], // Biru untuk lelaki, Pink untuk perempuan
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function initStaticCharts() {
  // Bar Chart: Trend Kehadiran Bulanan (Kekal statik buat masa ini)[cite: 9]
  const ctxKehadiran = document.getElementById("kehadiranChart");
  if (ctxKehadiran) {
    new Chart(ctxKehadiran, {
      type: "bar",
      data: {
        labels: ["Ogos", "Sept"],
        datasets: [{
          label: "Peratus Kehadiran (%)",
          data: [95.2, 96.2],
          backgroundColor: ["#3b82f6", "#10b981"],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: 60,
            max: 100
          }
        }
      }
    });
  }
}

// ==========================================
// 3. FUNGSI CARIAN GLOBAL (Sedia Ada)
// ==========================================
async function initGlobalSearch() {
  const searchInput = document.getElementById("quick-search-input");
  
  if (!searchInput) return;

  const searchWrapper = searchInput.parentElement;
  searchWrapper.classList.add("relative"); 
  
  const resultsContainer = document.createElement("div");
  resultsContainer.className = "absolute top-full left-0 mt-1 w-full lg:w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 hidden max-h-80 overflow-y-auto";
  searchWrapper.appendChild(resultsContainer);

  let senaraiMurid = []; 

  try {
    const querySnapshot = await getDocs(collection(db, "murid"));
    querySnapshot.forEach((doc) => {
      senaraiMurid.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error("Gagal menarik data murid untuk carian:", error);
  }

  searchInput.addEventListener("input", (e) => {
    const kataKunci = e.target.value.toLowerCase().trim();

    if (kataKunci.length === 0) {
      resultsContainer.classList.add("hidden");
      resultsContainer.innerHTML = "";
      return;
    }

    const hasilCarian = senaraiMurid.filter(murid => {
      const nama = (murid.nama || "").toLowerCase();
      const kp = (murid.nokp || "").toLowerCase();
      const kelas = (murid.kelas || "").toLowerCase();
      
      return nama.includes(kataKunci) || kp.includes(kataKunci) || kelas.includes(kataKunci);
    });

    resultsContainer.innerHTML = ""; 
    
    if (hasilCarian.length > 0) {
      hasilCarian.forEach(murid => {
        const item = document.createElement("div");
        item.className = "p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition";
        item.innerHTML = `
          <div>
            <p class="text-xs font-bold text-slate-800">${murid.nama || "Tiada Nama"}</p>
            <p class="text-[10px] text-slate-500">KP: ${murid.nokp || "-"} | Kelas: ${murid.kelas || "-"}</p>
          </div>
          <button class="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold hover:bg-blue-200 transition">Lihat</button>
        `;
        
        item.addEventListener("click", () => {
          alert(`Membuka profil: ${murid.nama}\nFungsi ini akan disambung ke halaman Profil Murid pada fasa seterusnya.`);
          searchInput.value = "";
          resultsContainer.classList.add("hidden");
        });

        resultsContainer.appendChild(item);
      });
    } else {
      resultsContainer.innerHTML = `<div class="p-4 text-center text-xs text-slate-500">Tiada rekod dijumpai untuk "${e.target.value}"</div>`;
    }

    resultsContainer.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!searchWrapper.contains(e.target)) {
      resultsContainer.classList.add("hidden");
    }
  });
}
