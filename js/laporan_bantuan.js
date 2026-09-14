// js/laporan_bantuan.js
import { db } from "./firebase-config.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const jadualLaporanBody = document.getElementById("jadual-laporan-body");
  const tapisJenisBantuan = document.getElementById("tapis-jenis-bantuan");
  const tapisKelasLaporan = document.getElementById("tapis-kelas-laporan");
  
  const statLayakRMT = document.getElementById("stat-layak-rmt");
  const statLayakBAP = document.getElementById("stat-layak-bap");
  const statDocPending = document.getElementById("stat-doc-pending");
  const btnExportCsv = document.getElementById("btn-export-csv");

  let senaraiMurid = [];
  let dataTapisSemasa = [];

  // ==========================================
  // FUNGSI 0: TARIK DATA DARI FIREBASE (REAL-TIME)
  // ==========================================
  const q = query(collection(db, "murid"), orderBy("nama", "asc"));
  
  onSnapshot(q, (snapshot) => {
    senaraiMurid = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nama: data.nama || "TIADA NAMA",
        mykid: data.mykid || "-",
        kelas: data.kelas || "-",
        waris: data.waris || "-",
        pendapatan: parseFloat(data.pendapatan) || 0,
        tanggungan: parseInt(data.tanggungan) || 1,
        perkapita: parseFloat(data.perkapita) || 0,
        dokumenLengkap: data.dokumenLengkap === true
      };
    });
    
    // Render laporan secara automatik selepas data siap ditarik
    filterLaporan(); 
  }, (error) => {
    console.error("Ralat memuatkan data laporan:", error);
    jadualLaporanBody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-red-500 font-bold text-xs">Ralat sambungan ke pangkalan data.</td></tr>`;
  });

  // ==========================================
  // FUNGSI 1: RENDER JADUAL & KIRA STATISTIK
  // ==========================================
  function renderJadualLaporan(data) {
    jadualLaporanBody.innerHTML = "";
    dataTapisSemasa = data; // Simpan rujukan untuk eksport CSV

    // Pembolehubah untuk statistik
    let jumlahRMT = 0;
    let jumlahBAP = data.length; // Andaian semua murid tersenarai layak BAP asas
    let jumlahDocPending = 0;

    if (data.length === 0) {
      jadualLaporanBody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-slate-500 text-xs">Tiada rekod padanan dijumpai.</td></tr>`;
    } else {
      data.forEach((murid, index) => {
        // Logik Kelayakan: Perkapita RM310 ke bawah layak RMT
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
          <td class="p-3 text-center"><span class="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-1 rounded text-[10px]">${murid.kelas}</span></td>
          <td class="p-3 uppercase text-[10px] sm:text-xs">${murid.waris}</td>
          <td class="p-3 text-slate-600">RM ${murid.pendapatan.toFixed(2)}</td>
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
      // BAP atau SEMUA memaparkan semua rekod (kerana BAP kini terbuka)

      // Tapis Kelas
      const matchKelas = kelas === "" || m.kelas === kelas;

      return matchBantuan && matchKelas;
    });

    renderJadualLaporan(filtered);
  }

  // Pasang Event Listener untuk Penapis
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
    let csvContent = "Bil,Nama Murid,No. MyKid,Kelas,Nama Penjaga,Pendapatan (RM),Tanggungan,Perkapita (RM),Status RMT,Dokumen Lengkap\n";

    // Isi Data
    dataTapisSemasa.forEach((m, index) => {
      const isRMT = m.perkapita <= 310 ? "Layak" : "Tidak Layak";
      const statusDokumen = m.dokumenLengkap ? "Ya" : "Tidak";
      
      // Gunakan " (quotes) untuk mengelakkan masalah fail rosak jika ada koma (,) dalam nama
      const baris = [
        index + 1,
        `"${m.nama}"`,
        `"${m.mykid}"`,
        m.kelas,
        `"${m.waris}"`,
        m.pendapatan.toFixed(2),
        m.tanggungan,
        m.perkapita.toFixed(2),
        isRMT,
        statusDokumen
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
});
