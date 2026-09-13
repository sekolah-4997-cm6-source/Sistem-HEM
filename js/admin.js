// js/admin.js

import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  initCharts();
  initGlobalSearch(); // Panggil fungsi carian apabila halaman dimuatkan
});

// ==========================================
// 1. FUNGSI GRAF & CARTA (Sedia Ada)
// ==========================================
function initCharts() {
  // Donut Chart: Enrolmen Murid Tahap 1 & Tahap 2
  const ctxEnrolmen = document.getElementById("enrolmenChart");
  if (ctxEnrolmen) {
    new Chart(ctxEnrolmen, {
      type: "doughnut",
      data: {
        labels: ["Tahap 1 (410)", "Tahap 2 (440)"],
        datasets: [{
          data: [410, 440],
          backgroundColor: ["#3b82f6", "#0284c7"],
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

  // Bar Chart: Trend Kehadiran Bulanan
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
// 2. FUNGSI CARIAN GLOBAL (Baharu)
// ==========================================
async function initGlobalSearch() {
  const searchInput = document.getElementById("quick-search-input");
  
  if (!searchInput) return;

  // Sediakan container untuk dropdown hasil carian
  const searchWrapper = searchInput.parentElement;
  searchWrapper.classList.add("relative"); // Pastikan container ini relative
  
  const resultsContainer = document.createElement("div");
  resultsContainer.className = "absolute top-full left-0 mt-1 w-full lg:w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 hidden max-h-80 overflow-y-auto";
  searchWrapper.appendChild(resultsContainer);

  let senaraiMurid = []; // Simpanan sementara data murid

  // Tarik data murid dari Firestore (Hanya sekali untuk jimatkan kuota)
  try {
    // Nota: Pastikan anda ada collection bernama "murid" di Firestore
    const querySnapshot = await getDocs(collection(db, "murid"));
    querySnapshot.forEach((doc) => {
      senaraiMurid.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error("Gagal menarik data murid untuk carian:", error);
  }

  // Fungsi apabila pengguna menaip
  searchInput.addEventListener("input", (e) => {
    const kataKunci = e.target.value.toLowerCase().trim();

    // Jika kotak carian kosong, sembunyikan dropdown
    if (kataKunci.length === 0) {
      resultsContainer.classList.add("hidden");
      resultsContainer.innerHTML = "";
      return;
    }

    // Tapis data murid berdasarkan Nama, KP, atau Kelas
    const hasilCarian = senaraiMurid.filter(murid => {
      const nama = (murid.nama || "").toLowerCase();
      const kp = (murid.nokp || "").toLowerCase();
      const kelas = (murid.kelas || "").toLowerCase();
      
      return nama.includes(kataKunci) || kp.includes(kataKunci) || kelas.includes(kataKunci);
    });

    // Paparkan Hasil Carian
    resultsContainer.innerHTML = ""; // Kosongkan paparan lama
    
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
        
        // Tindakan apabila butang "Lihat" atau baris ditekan
        item.addEventListener("click", () => {
          // Akan bawa pengguna ke profil murid (Boleh disesuaikan nanti)
          alert(`Membuka profil: ${murid.nama}\nFungsi ini akan disambung ke halaman Profil Murid pada fasa seterusnya.`);
          searchInput.value = "";
          resultsContainer.classList.add("hidden");
        });

        resultsContainer.appendChild(item);
      });
    } else {
      // Jika tiada padanan
      resultsContainer.innerHTML = `<div class="p-4 text-center text-xs text-slate-500">Tiada rekod dijumpai untuk "${e.target.value}"</div>`;
    }

    // Paparkan kotak dropdown
    resultsContainer.classList.remove("hidden");
  });

  // Sembunyikan dropdown apabila klik di luar kawasan carian
  document.addEventListener("click", (e) => {
    if (!searchWrapper.contains(e.target)) {
      resultsContainer.classList.add("hidden");
    }
  });
}
