// js/admin.js

import { db } from "./firebase-config.js";
import { collection, getDocs, onSnapshot, query, where, limit, orderBy, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let enrolmenChartInstance = null; 
let kehadiranChartInstance = null; // Tambah instance untuk graf kehadiran

document.addEventListener("DOMContentLoaded", () => {
  initGlobalSearch(); 
  muatDataKehadiranLive(); // Menggantikan initStaticCharts()
  muatDataDashboard(); 
  muatDataTakwim();    
  muatDataSKPMg2();    
});

// ==========================================
// 1. MUAT DATA PAPAN PEMUKA (DINAMIK)
// ==========================================
async function muatDataDashboard() {
  try {
    // A. Tarik Data Murid (Enrolmen & B40)
    const muridSnap = await getDocs(collection(db, "murid"));
    let totalLelaki = 0;
    let totalPerempuan = 0;
    let totalB40 = 0;

    muridSnap.forEach((doc) => {
      const data = doc.data();
      if (data.jantina === 'L' || data.jantina === 'Lelaki') {
        totalLelaki++;
      } else if (data.jantina === 'P' || data.jantina === 'Perempuan') {
        totalPerempuan++;
      }
      if (data.layakRmt === true || data.layakRMT === true || data.pendapatan <= 1169) {
        totalB40++;
      }
    });

    const totalMurid = totalLelaki + totalPerempuan;
    const kpiEnrolmen = document.getElementById("kpi-enrolmen");
    if (kpiEnrolmen) kpiEnrolmen.innerHTML = `${totalMurid} <span class="text-xs font-normal text-slate-500">(${totalLelaki}L / ${totalPerempuan}P)</span>`;

    const kpiRmt = document.getElementById("kpi-rmt");
    if (kpiRmt) kpiRmt.innerHTML = `${totalB40} <span class="text-xs font-normal text-slate-500">Layak RMT</span>`;

    renderEnrolmenChart(totalLelaki, totalPerempuan);

    // B. Tarik Data Disiplin & Kemaskini Alert Bar Kritikal
    const qDisiplin = query(collection(db, "disiplin"), where("status", "==", "Belum Selesai"));
    onSnapshot(qDisiplin, (snapshot) => {
      const jumlahKes = snapshot.size;
      const kpiDisiplin = document.getElementById("kpi-disiplin");
      if (kpiDisiplin) kpiDisiplin.innerText = `${jumlahKes} Kes`;

      // Logik Alert Bar Kritikal
      const alertContainer = document.getElementById("alert-bar-container");
      if (alertContainer) {
        let alertHTML = "";
        let adaKritikal = false;
        let adaPonteng = false;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.kategori === "BERAT" && !adaKritikal) {
                alertHTML += `
                  <div class="flex justify-between items-center bg-white p-2.5 rounded-lg border border-red-200">
                    <span class="text-slate-700 truncate max-w-[200px]" title="${data.keterangan}">🚨 <strong>Kritikal:</strong> ${data.keterangan || 'Salah Laku'} (${data.muridNama})</span>
                    <button onclick="window.location.href='disiplin.html'" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-[11px] font-semibold transition flex-shrink-0">Tindak</button>
                  </div>
                `;
                adaKritikal = true;
            }
            if (data.kategori === "PONTENG" && !adaPonteng) {
                alertHTML += `
                  <div class="flex justify-between items-center bg-white p-2.5 rounded-lg border border-amber-200">
                    <span class="text-slate-700 truncate max-w-[200px]">🏃 <strong>Ponteng:</strong> ${data.muridNama}</span>
                    <button onclick="window.location.href='disiplin.html'" class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-[11px] font-semibold transition flex-shrink-0">Semak</button>
                  </div>
                `;
                adaPonteng = true;
            }
        });

        if (alertHTML === "") {
            alertContainer.innerHTML = `<div class="col-span-1 md:col-span-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center font-semibold">✅ Tiada kes disiplin atau amaran ponteng aktif buat masa ini.</div>`;
        } else {
            alertContainer.innerHTML = alertHTML;
        }
      }
    });

  } catch (error) {
    console.error("Ralat memuat data papan pemuka:", error);
  }
}

// ==========================================
// 2. FUNGSI TAKWIM & e-FILING SKPMg2
// ==========================================
function muatDataTakwim() {
  const qTakwim = query(collection(db, "takwim"), orderBy("tarikh", "asc"), limit(4));
  onSnapshot(qTakwim, (snapshot) => {
    const container = document.getElementById("takwim-list-container");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (snapshot.empty) {
        container.innerHTML = `<li class="text-slate-400 italic">Tiada program direkodkan.</li>`;
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        let formattedDate = data.tarikh; 
        
        try {
            const d = new Date(data.tarikh);
            if(!isNaN(d)) formattedDate = d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
        } catch(e) {}

        container.innerHTML += `
          <li class="flex items-center space-x-2">
            <i class="fa-regular fa-calendar text-slate-400"></i>
            <span><strong>${formattedDate}:</strong> ${data.program}</span>
          </li>
        `;
    });
  });
}

// Pengiraan Jumlah Dokumen Dari efiling_skas
function muatDataSKPMg2() {
  
  const qSemua = collection(db, "efiling");
  const sasaranDokumen = { "S1": 10, "S2": 15, "S3": 20, "S4": 12 };

  onSnapshot(qSemua, (snapshot) => {
    const kiraan = { "S1": 0, "S2": 0, "S3": 0, "S4": 0 };

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (kiraan[data.standard] !== undefined) {
        kiraan[data.standard]++;
      }
    });

    // Pengiraan Peratusan & Hadkan maksimum 100%
    const p1 = Math.min(Math.round((kiraan["S1"] / sasaranDokumen["S1"]) * 100), 100);
    const p2 = Math.min(Math.round((kiraan["S2"] / sasaranDokumen["S2"]) * 100), 100);
    const p3 = Math.min(Math.round((kiraan["S3"] / sasaranDokumen["S3"]) * 100), 100);
    const p4 = Math.min(Math.round((kiraan["S4"] / sasaranDokumen["S4"]) * 100), 100);

    // Hantar ke UI Dashboard
    setPeratusColor("skpmg-s1", p1);
    setPeratusColor("skpmg-s2", p2);
    setPeratusColor("skpmg-s3", p3);
    setPeratusColor("skpmg-s4", p4);
    
  }, (error) => {
    console.error("Ralat menarik data e-Filing secara langsung:", error);
  });
}
function setPeratusColor(elementId, nilai) {
  const el = document.getElementById(elementId);
  // Mengekstrak ID bar (cth: "skpmg-s1" menjadi "bar-s1")
  const barId = `bar-${elementId.split('-')[1]}`; 
  const barEl = document.getElementById(barId);
  
  if(!el) return;
  
  const peratusan = parseFloat(nilai).toFixed(0); 
  el.innerText = `${peratusan}%`;
  
  // Reset kelas teks & bar
  el.className = "font-bold text-xs";
  if (barEl) {
    barEl.style.width = `${peratusan}%`;
    barEl.className = "h-1.5 rounded-full transition-all duration-700 ease-out"; // Animasi pergerakan
  }
  
  // Logik warna: Hijau (>=85%), Kuning (>=60%), Merah (<60%)
  if (peratusan >= 85) {
    el.classList.add("text-emerald-600");
    if (barEl) barEl.classList.add("bg-emerald-500");
  } else if (peratusan >= 60) {
    el.classList.add("text-amber-500");
    if (barEl) barEl.classList.add("bg-amber-400");
  } else {
    el.classList.add("text-red-600");
    if (barEl) barEl.classList.add("bg-red-500");
  }
}


// ==========================================
// 3. FUNGSI GRAF & CARIAN 
// ==========================================
function renderEnrolmenChart(lelaki, perempuan) {
  const ctxEnrolmen = document.getElementById("enrolmenChart");
  if (!ctxEnrolmen) return;
  if (enrolmenChartInstance) enrolmenChartInstance.destroy();

  enrolmenChartInstance = new Chart(ctxEnrolmen, {
    type: "doughnut",
    data: {
      labels: [`Lelaki (${lelaki})`, `Perempuan (${perempuan})`],
      datasets: [{
        data: [lelaki, perempuan],
        backgroundColor: ["#3b82f6", "#ec4899"],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

// Fungsi baharu untuk menarik data kehadiran dari Firestore
async function muatDataKehadiranLive() {
  try {
    const qKehadiran = query(collection(db, "kehadiran"), orderBy("tarikh", "desc"), limit(5));
    const snapshot = await getDocs(qKehadiran);

    let labelsTarikh = [];
    let dataPeratus = [];
    let peratusHariIni = 0;

    if (!snapshot.empty) {
      const rekodSementara = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        let peratus = 0;
        
        if (data.jumlahMurid > 0) {
          peratus = ((data.jumlahHadir / data.jumlahMurid) * 100).toFixed(1);
        }
        
        rekodSementara.push({
          tarikh: data.tarikh || doc.id,
          peratus: parseFloat(peratus)
        });
      });

      rekodSementara.reverse();

      rekodSementara.forEach(r => {
        const d = new Date(r.tarikh);
        const labelText = isNaN(d) ? r.tarikh : d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
        
        labelsTarikh.push(labelText);
        dataPeratus.push(r.peratus);
      });

      peratusHariIni = rekodSementara[rekodSementara.length - 1].peratus;
    } else {
      labelsTarikh = ["Tiada Data"];
      dataPeratus = [0];
    }

    const kpiKehadiranEl = document.getElementById("kpi-kehadiran");
    if (kpiKehadiranEl) {
      kpiKehadiranEl.innerText = `${peratusHariIni}%`;
      
      if (peratusHariIni >= 90) {
        kpiKehadiranEl.className = "text-2xl font-bold text-emerald-600 mt-1";
      } else if (peratusHariIni >= 80) {
        kpiKehadiranEl.className = "text-2xl font-bold text-amber-500 mt-1";
      } else {
        kpiKehadiranEl.className = "text-2xl font-bold text-red-600 mt-1";
      }
    }

    renderKehadiranChart(labelsTarikh, dataPeratus);

  } catch (error) {
    console.error("Ralat menarik data kehadiran live:", error);
  }
}

// Fungsi baharu untuk memaparkan graf kehadiran Chart.js
function renderKehadiranChart(labels, data) {
  const ctx = document.getElementById("kehadiranChart");
  if (!ctx) return;
  if (kehadiranChartInstance) kehadiranChartInstance.destroy();

  kehadiranChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Peratus Kehadiran (%)",
        data: data,
        backgroundColor: "#3b82f6",
        borderRadius: 4,
        barThickness: 30
      }]
    },
    options: {
      responsive: true, 
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { 
        y: { 
          beginAtZero: false, 
          min: 50, 
          max: 100 
        } 
      }
    }
  });
}

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
    querySnapshot.forEach((doc) => { senaraiMurid.push({ id: doc.id, ...doc.data() }); });
  } catch (error) {}

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
          alert(`Membuka profil: ${murid.nama}`);
          searchInput.value = "";
          resultsContainer.classList.add("hidden");
        });
        resultsContainer.appendChild(item);
      });
    } else {
      resultsContainer.innerHTML = `<div class="p-4 text-center text-xs text-slate-500">Tiada rekod dijumpai</div>`;
    }
    resultsContainer.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!searchWrapper.contains(e.target)) resultsContainer.classList.add("hidden");
  });
}
