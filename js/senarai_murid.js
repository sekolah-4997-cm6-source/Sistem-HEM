// js/senarai_murid.js

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("jadual-murid-body");
  const searchInput = document.getElementById("search-keyword");
  const filterKelas = document.getElementById("filter-kelas");
  const filterBantuan = document.getElementById("filter-bantuan");
  const filterDokumen = document.getElementById("filter-dokumen");

  // Contoh Data (Dummy Data) untuk paparan UI. (Nanti ganti dengan data dari Firebase)
  const senaraiMurid = [
    {
      id: 1, nama: "AHMAD BIN ABU", mykid: "120304021234", kelas: "6A",
      waris: "ABU BIN HASSAN", telWaris: "0123456789", waris2: "SITI BINTI ALI", telWaris2: "0198765432",
      perkapita: 250, kesihatan: "Asma Ringan", alamat: "No. 12, FELDA Laka Selatan", dokumenLengkap: true
    },
    {
      id: 2, nama: "NURUL AMINA BINTI KASSIM", mykid: "140506029988", kelas: "4A",
      waris: "KASSIM BIN SELAMAT", telWaris: "0112233445", waris2: "", telWaris2: "",
      perkapita: 850, kesihatan: "Tiada", alamat: "Blok B, FELDA Laka Selatan", dokumenLengkap: false
    },
    {
      id: 3, nama: "CHONG WEI MING", mykid: "150101027777", kelas: "3A",
      waris: "CHONG KIN KEE", telWaris: "0134455667", waris2: "", telWaris2: "",
      perkapita: 300, kesihatan: "Alahan Seafood", alamat: "Kuarters Guru SK Laka Selatan", dokumenLengkap: true
    }
  ];

  // Fungsi untuk memaparkan data ke dalam jadual
  function renderTable(data) {
    tbody.innerHTML = ""; // Kosongkan jadual sedia ada

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-500 text-xs">Tiada rekod murid dijumpai.</td></tr>`;
      return;
    }

    data.forEach((murid, index) => {
      const isRMT = murid.perkapita <= 310;
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
          <div class="font-bold text-slate-800">${murid.nama}</div>
          <div class="text-[10px] text-slate-400">${murid.mykid}</div>
        </td>
        <td class="p-3">
          <span class="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-1 rounded">${murid.kelas}</span>
        </td>
        <td class="p-3">
          <div class="font-semibold uppercase">${murid.waris}</div>
          <div class="flex items-center space-x-2 mt-1">
            <a href="tel:${murid.telWaris}" class="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] flex items-center space-x-1">
              <i class="fa-solid fa-phone"></i> <span>${murid.telWaris}</span>
            </a>
          </div>
        </td>
        <td class="p-3">
          <div class="font-bold ${isRMT ? 'text-emerald-600' : 'text-slate-700'}">RM ${murid.perkapita.toFixed(2)}</div>
          ${perkapitaLabel}
        </td>
        <td class="p-3">${dokumenBadge}</td>
        <td class="p-3 text-center space-x-1">
          <button onclick="bukaKadCemas('${murid.nama}', '${murid.kelas}', '${murid.waris}', '${murid.telWaris}', '${murid.waris2}', '${murid.telWaris2}', 'RM ${murid.perkapita.toFixed(2)}', '${murid.kesihatan}', '${murid.alamat}')" 
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

  // Fungsi Logik Tapisan (Filter & Search)
  function filterData() {
    const keyword = searchInput.value.toLowerCase();
    const kelasVal = filterKelas.value;
    const bantuanVal = filterBantuan.value;
    const docVal = filterDokumen.value;

    const filtered = senaraiMurid.filter(m => {
      // 1. Tapis Kata Kunci (Nama / MyKid)
      const matchSearch = m.nama.toLowerCase().includes(keyword) || m.mykid.includes(keyword);
      
      // 2. Tapis Kelas
      const matchKelas = kelasVal === "" || m.kelas === kelasVal;
      
      // 3. Tapis Bantuan
      let matchBantuan = true;
      if (bantuanVal === "RMT") matchBantuan = m.perkapita <= 310;
      if (bantuanVal === "BUKAN_RMT") matchBantuan = m.perkapita > 310;

      // 4. Tapis Status Dokumen
      let matchDoc = true;
      if (docVal === "LENGKAP") matchDoc = m.dokumenLengkap === true;
      if (docVal === "TAK_LENGKAP") matchDoc = m.dokumenLengkap === false;

      return matchSearch && matchKelas && matchBantuan && matchDoc;
    });

    renderTable(filtered);
  }

  // Pasang Event Listener untuk Penapis
  searchInput.addEventListener("input", filterData);
  filterKelas.addEventListener("change", filterData);
  filterBantuan.addEventListener("change", filterData);
  filterDokumen.addEventListener("change", filterData);

  // Papar jadual penuh sewaktu halaman mula dimuatkan
  renderTable(senaraiMurid);
});
