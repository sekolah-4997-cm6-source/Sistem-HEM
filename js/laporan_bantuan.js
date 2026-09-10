// js/laporan_bantuan.js

document.addEventListener("DOMContentLoaded", () => {
  const jadualLaporanBody = document.getElementById("jadual-laporan-body");
  const tapisJenisBantuan = document.getElementById("tapis-jenis-bantuan");
  const tapisKelasLaporan = document.getElementById("tapis-kelas-laporan");
  
  const statLayakRMT = document.getElementById("stat-layak-rmt");
  const statLayakBAP = document.getElementById("stat-layak-bap");
  const statDocPending = document.getElementById("stat-doc-pending");
  const btnExportCsv = document.getElementById("btn-export-csv");

  // --- Contoh Data (Dummy Data) ---
  // Di dunia sebenar, data ini ditarik dari pangkalan data (contoh: Firebase)
  const senaraiMurid = [
    {
      id: 1, nama: "AHMAD BIN ABU", mykid: "140304021234", kelas: "6A",
      waris: "ABU BIN HASSAN", pendapatan: 1000.00, tanggungan: 4, perkapita: 250.00, dokumenLengkap: true
    },
    {
      id: 2, nama: "NURUL AMINA BINTI KASSIM", mykid: "160506029988", kelas: "4A",
      waris: "KASSIM BIN SELAMAT", pendapatan: 3400.00, tanggungan: 4, perkapita: 850.00, dokumenLengkap: false
    },
    {
      id: 3, nama: "CHONG WEI MING", mykid: "170101027777", kelas: "3A",
      waris: "CHONG KIN KEE", pendapatan: 1500.00, tanggungan: 5, perkapita: 300.00, dokumenLengkap: true
    },
    {
      id: 4, nama: "SITI NURHALIZA BINTI AWANG", mykid: "150909028888", kelas: "5A",
      waris: "AWANG BIN SULONG", pendapatan: 900.00, tanggungan: 3, perkapita: 300.00, dokumenLengkap: false
    },
    {
      id: 5, nama: "MUTHU A/L RAMASAMY", mykid: "180202026666", kelas: "2A",
      waris: "RAMASAMY A/L VEERAN", pendapatan: 2000.00, tanggungan: 4, perkapita: 500.00, dokumenLengkap: true
    }
  ];

  let dataTapisSemasa = [];

  // ==========================================
  // FUNGSI 1: RENDER JADUAL & KIRA STATISTIK
  // ==========================================
  function renderJadualLaporan(data) {
    jadualLaporanBody.innerHTML = "";
    dataTapisSemasa = data; // Simpan rujukan untuk eksport CSV

    // Pembolehubah untuk statistik
    let jumlahRMT = 0;
    let jumlahBAP = data.length; // Andaian semua murid dalam senarai layak BAP asas
    let jumlahDocPending = 0;

    if (data.length === 0) {
      jadualLaporanBody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-slate-500 text-xs">Tiada rekod padanan dijumpai.</td></tr>`;
    } else {
      data.forEach((murid, index) => {
        const isRMT = murid.perkapita <= 310;
        
        // Kemaskini statistik
        if (isRMT) jumlahRMT++;
        if (!murid.dokumenLengkap) jumlahDocPending++;

        const statusRMTBadge = isRMT 
          ? `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">Layak</span>`
          : `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[10px]">Tidak Layak</span>`;

        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
        tr.innerHTML = `
          <td class="p-3 font-semibold">${index + 1}</td>
          <td class="p-3 font-bold text-slate-800 uppercase">${murid.nama}</td>
          <td class="p-3">${murid.mykid}</td>
          <td class="p-3">${murid.kelas}</td>
          <td class="p-3 uppercase">${murid.waris}</td>
          <td class="p-3">RM ${murid.pendapatan.toFixed(2)}</td>
          <td class="p-3 font-bold ${isRMT ? 'text-emerald-600' : 'text-slate-700'}">RM ${murid.perkapita.toFixed(2)}</td>
          <td class="p-3">${statusRMTBadge}</td>
        `;
        jadualLaporanBody.appendChild(tr);
      });
    }

    // Kemaskini paparan statistik UI
    statLayakRMT.textContent = `${jumlahRMT} Murid`;
    statLayakBAP.textContent = `${jumlahBAP} Murid`;
    statDocPending.textContent = `${jumlahDocPending} Murid`;
  }

  // ==========================================
  // FUNGSI 2: LOGIK PENAPISAN (FILTER)
  // ==========================================
  function filterLaporan() {
    const jenisBantuan = tapisJenisBantuan.value;
    const kelas = tapisKelasLaporan.value;

    const filtered = senaraiMurid.filter(m => {
      // Tapis Jenis Bantuan
      let matchBantuan = true;
      if (jenisBantuan === "RMT") {
        matchBantuan = m.perkapita <= 310;
      }
      // BAP atau SEMUA memaparkan semua rekod asas

      // Tapis Kelas
      const matchKelas = kelas === "" || m.kelas === kelas;

      return matchBantuan && matchKelas;
    });

    renderJadualLaporan(filtered);
  }

  // Pasang Event Listener
  tapisJenisBantuan.addEventListener("change", filterLaporan);
  tapisKelasLaporan.addEventListener("change", filterLaporan);

  // ==========================================
  // FUNGSI 3: EKSPORT KE CSV
  // ==========================================
  btnExportCsv.addEventListener("click", () => {
    if (dataTapisSemasa.length === 0) {
      alert("Tiada data untuk dieksport.");
      return;
    }

    // Tajuk Kolum CSV
    let csvContent = "Bil,Nama Murid,No. MyKid,Kelas,Nama Penjaga,Pendapatan (RM),Tanggungan,Perkapita (RM),Status RMT\n";

    // Isi Data
    dataTapisSemasa.forEach((m, index) => {
      const isRMT = m.perkapita <= 310 ? "Layak" : "Tidak Layak";
      // Gunakan " (quotes) untuk mengelakkan masalah jika ada koma (,) dalam nama
      const baris = [
        index + 1,
        `"${m.nama}"`,
        `"${m.mykid}"`,
        m.kelas,
        `"${m.waris}"`,
        m.pendapatan.toFixed(2),
        m.tanggungan,
        m.perkapita.toFixed(2),
        isRMT
      ];
      csvContent += baris.join(",") + "\n";
    });

    // Proses Muat Turun Fail
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Bantuan_SKLAKASELATAN_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // ==========================================
  // INITIALIZATION
  // ==========================================
  // Papar semua murid yang layak RMT sebagai paparan (default) mula
  filterLaporan();
});
