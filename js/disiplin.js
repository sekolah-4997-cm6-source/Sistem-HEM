// js/disiplin.js

document.addEventListener("DOMContentLoaded", () => {
  const borangDisiplin = document.getElementById("borang-disiplin");
  const jadualDisiplin = document.getElementById("jadual-disiplin-body");

  // Data Dummy untuk paparan awal rekod disiplin
  let rekodDisiplin = [
    {
      id: 1, tarikh: "2026-09-08 10:30", murid: "AHMAD BIN ABU (6A)", 
      kategori: "BERAT", keterangan: "Bergaduh di kantin.", status: "Kritikal"
    },
    {
      id: 2, tarikh: "2026-09-07 08:00", murid: "SITI NURHALIZA (5B)", 
      kategori: "PONTENG", keterangan: "Tidak hadir 3 hari berturut-turut tanpa surat.", status: "Amaran"
    },
    {
      id: 3, tarikh: "2026-09-05 13:00", murid: "ALI BIN MUTHU (4A)", 
      kategori: "AMALAN_BAIK", keterangan: "Memulangkan dompet guru.", status: "Pujian"
    }
  ];

  // Fungsi memaparkan rekod ke dalam jadual
  function renderJadualDisiplin() {
    jadualDisiplin.innerHTML = "";

    if (rekodDisiplin.length === 0) {
      jadualDisiplin.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500 text-xs">Tiada rekod buat masa ini.</td></tr>`;
      return;
    }

    rekodDisiplin.forEach((rekod) => {
      let badgeKategori = "";
      // Logik Warna mengikut Kategori Kes
      if (rekod.kategori === "BERAT") {
        badgeKategori = `<span class="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">🔴 Salah Laku Berat</span>`;
      } else if (rekod.kategori === "PONTENG") {
        badgeKategori = `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">🟡 Ponteng</span>`;
      } else if (rekod.kategori === "AMALAN_BAIK") {
        badgeKategori = `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">🟢 Amalan Baik</span>`;
      } else {
        badgeKategori = `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">⚪ Biasa</span>`;
      }

      // Format Tarikh & Masa
      const tarikhFormat = new Date(rekod.tarikh).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
      tr.innerHTML = `
        <td class="p-2 whitespace-nowrap text-[10px] text-slate-500">${tarikhFormat}</td>
        <td class="p-2 font-bold text-slate-800">${rekod.murid}</td>
        <td class="p-2">${badgeKategori}</td>
        <td class="p-2 truncate max-w-xs">${rekod.keterangan}</td>
        <td class="p-2 text-center">
          <button class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-[10px] font-semibold transition">Semak</button>
        </td>
      `;
      jadualDisiplin.appendChild(tr);
    });
  }

  // Fungsi Tambah Kes Baru
  if (borangDisiplin) {
    borangDisiplin.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const murid = document.getElementById("input-murid-kes").value.toUpperCase();
      const tarikh = document.getElementById("input-tarikh-kes").value;
      const kategori = document.getElementById("kategori-kes").value;
      const keterangan = document.getElementById("keterangan-kes").value;

      const kesBaru = {
        id: rekodDisiplin.length + 1,
        tarikh: tarikh,
        murid: murid,
        kategori: kategori,
        keterangan: keterangan,
        status: "Baru"
      };

      // Tambah ke senarai teratas (unshift)
      rekodDisiplin.unshift(kesBaru);
      
      // Papar semula jadual
      renderJadualDisiplin();
      
      // Kosongkan borang
      borangDisiplin.reset();

      // Maklumkan jika ia kes berat (Trigger Alert Bar)
      if (kategori === "BERAT") {
        alert("AMARAN: Kes Salah Laku Berat telah direkodkan!\nAlert Bar Kritikal akan memaparkan notifikasi ini kepada Pentadbir.");
      } else {
        alert("Rekod telah berjaya disimpan.");
      }
    });
  }

  // Paparan permulaan
  renderJadualDisiplin();
});
