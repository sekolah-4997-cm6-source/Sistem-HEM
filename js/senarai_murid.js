// js/senarai_murid.js
import { db } from "./firebase_config.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("jadual-murid-body");
  const searchInput = document.getElementById("search-keyword");
  const filterKelas = document.getElementById("filter-kelas");
  const filterBantuan = document.getElementById("filter-bantuan");
  const filterDokumen = document.getElementById("filter-dokumen");

  let senaraiMurid = [];

  // Pautan Masa Nyata (Real-time listener) ke Koleksi 'murid'
  const q = query(collection(db, "murid"), orderBy("nama", "asc"));
  
  onSnapshot(q, (snapshot) => {
    senaraiMurid = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    filterData(); // Render semula apabila data Firestore berubah
  }, (error) => {
    console.error("Ralat memuatkan data murid:", error);
    tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-red-500 text-xs">Ralat memuatkan data dari pangkalan data.</td></tr>`;
  });

  function renderTable(data) {
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-500 text-xs">Tiada rekod murid dijumpai.</td></tr>`;
      return;
    }

    data.forEach((murid, index) => {
      const isRMT = (murid.perkapita || 0) <= 310;
      const perkapitaLabel = isRMT 
        ? `<span class="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded mt-1 inline-block">Layak RMT</span>`
        : ``;
      
      const dokumenBadge = murid.dokumenLengkap 
        ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700">🟢 Lengkap</span>`
        : `<span class="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700">🔴 Tak Lengkap</span>`;

      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
      
      tr.innerHTML = `
        <td class="p-3 font-semibold">${index + 1}</td>
        <td class="p-3">
          <div class="font-bold text-slate-800">${murid.nama || ''}</div>
          <div class="text-[10px] text-slate-400">${murid.mykid || ''}</div>
        </td>
        <td class="p-3">
          <span class="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-1 rounded">${murid.kelas || ''}</span>
        </td>
        <td class="p-3">
          <div class="font-semibold uppercase">${murid.waris || ''}</div>
          <div class="flex items-center space-x-2 mt-1">
            <a href="tel:${murid.telWaris}" class="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] flex items-center space-x-1">
              <i class="fa-solid fa-phone"></i> <span>${murid.telWaris || '-'}</span>
            </a>
          </div>
        </td>
        <td class="p-3">
          <div class="font-bold ${isRMT ? 'text-emerald-600' : 'text-slate-700'}">RM ${(murid.perkapita || 0).toFixed(2)}</div>
          ${perkapitaLabel}
        </td>
        <td class="p-3">${dokumenBadge}</td>
        <td class="p-3 text-center space-x-1">
          <button onclick="bukaKadCemas('${murid.nama}', '${murid.kelas}', '${murid.waris}', '${murid.telWaris}', '${murid.waris2 || ''}', '${murid.telWaris2 || ''}', 'RM ${(murid.perkapita || 0).toFixed(2)}', '${murid.kesihatan || 'Tiada'}', '${murid.alamat || ''}')" 
            class="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1.5 rounded text-[10px] font-semibold transition" title="Carian Kecemasan Waris">
            🚨 Cemas
          </button>
          <a href="profil_murid.html?id=${murid.id}" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1.5 rounded text-[10px] font-semibold transition inline-block">
            <i class="fa-solid fa-pen-to-square"></i>
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function filterData() {
    const keyword = searchInput.value.toLowerCase();
    const kelasVal = filterKelas.value;
    const bantuanVal = filterBantuan.value;
    const docVal = filterDokumen.value;

    const filtered = senaraiMurid.filter(m => {
      const matchSearch = (m.nama || '').toLowerCase().includes(keyword) || (m.mykid || '').includes(keyword);
      const matchKelas = kelasVal === "" || m.kelas === kelasVal;
      
      let matchBantuan = true;
      if (bantuanVal === "RMT") matchBantuan = (m.perkapita || 0) <= 310;
      if (bantuanVal === "BUKAN_RMT") matchBantuan = (m.perkapita || 0) > 310;

      let matchDoc = true;
      if (docVal === "LENGKAP") matchDoc = m.dokumenLengkap === true;
      if (docVal === "TAK_LENGKAP") matchDoc = m.dokumenLengkap === false;

      return matchSearch && matchKelas && matchBantuan && matchDoc;
    });

    renderTable(filtered);
  }

  searchInput.addEventListener("input", filterData);
  filterKelas.addEventListener("change", filterData);
  filterBantuan.addEventListener("change", filterData);
  filterDokumen.addEventListener("change", filterData);
});
