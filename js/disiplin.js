// js/disiplin.js

import { db } from "./firebase-config.js"; // PASTIKAN EJAAN NAMA FAIL INI BETUL
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const borangDisiplin = document.getElementById("borang-disiplin");
  const jadualDisiplin = document.getElementById("jadual-disiplin-body");

  // Array kosong untuk simpan data dari database
  let senaraiRekod = [];

  // 1. Fungsi Langgan Data dari Firestore (Real-time)
  function langganRekodDisiplin() {
    if (!jadualDisiplin) return;
    
    // Susun data dari yang paling terkini (descending)
    const q = query(collection(db, "disiplin"), orderBy("tarikh", "desc"));
    
    onSnapshot(q, (snapshot) => {
      senaraiRekod = [];
      snapshot.forEach((doc) => {
        senaraiRekod.push({ id: doc.id, ...doc.data() });
      });
      renderJadualDisiplin();
    }, (error) => {
      console.error("Ralat mengambil data disiplin: ", error);
    });
  }

  // 2. Fungsi memaparkan rekod ke dalam jadual
  function renderJadualDisiplin() {
    if (!jadualDisiplin) return;
    jadualDisiplin.innerHTML = "";

    if (senaraiRekod.length === 0) {
      jadualDisiplin.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-500 text-xs">Tiada rekod buat masa ini.</td></tr>`;
      return;
    }

    senaraiRekod.forEach((rekod) => {
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
        <td class="p-2 text-center space-x-1">
          <button data-id="${rekod.id}" class="btn-semak bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-[10px] font-semibold transition">Semak</button>
          <button data-id="${rekod.id}" class="btn-padam bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-[10px] font-semibold transition"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      jadualDisiplin.appendChild(tr);
    });

    // Binding Event Listener untuk Butang Semak & Padam (Selepas HTML dijana)
    document.querySelectorAll(".btn-semak").forEach(btn => {
      btn.addEventListener("click", (e) => {
        // Cari ID rekod dari butang yang ditekan
        const id = e.currentTarget.getAttribute("data-id");
        bukaPopupSemakan(id);
      });
    });

    document.querySelectorAll(".btn-padam").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if(confirm("Adakah anda pasti mahu memadam rekod ini secara kekal?")) {
           try {
             await deleteDoc(doc(db, "disiplin", id));
           } catch(error) {
             console.error("Ralat memadam rekod:", error);
             alert("Gagal memadam rekod.");
           }
        }
      });
    });
  }

  // 3. Fungsi Tambah Kes Baru (Hantar ke Firestore)
  if (borangDisiplin) {
    borangDisiplin.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const murid = document.getElementById("input-murid-kes").value.toUpperCase();
      const tarikh = document.getElementById("input-tarikh-kes").value;
      const kategori = document.getElementById("kategori-kes").value;
      const keterangan = document.getElementById("keterangan-kes").value;
      
      const btnSubmit = borangDisiplin.querySelector("button[type='submit']");
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Menyimpan ke Database...";
      }

      try {
        await addDoc(collection(db, "disiplin"), {
          murid: murid,
          tarikh: tarikh,
          kategori: kategori,
          keterangan: keterangan,
          status: "Baru",
          timestamp: new Date().toISOString()
        });

        borangDisiplin.reset();

        if (kategori === "BERAT") {
          alert("AMARAN: Kes Salah Laku Berat telah direkodkan!\nMaklumat telah disimpan ke pangkalan data.");
        } else {
          alert("Rekod telah berjaya disimpan.");
        }
      } catch (error) {
        console.error("Ralat menyimpan kes:", error);
        alert("Gagal menyimpan rekod. Sila semak sambungan internet.");
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Simpan Rekod"; // Boleh tukar nama butang ikut kesesuaian
        }
      }
    });
  }

  // 4. Fungsi Buka Popup Semakan
  function bukaPopupSemakan(id) {
    const rekod = senaraiRekod.find(r => r.id === id);
    if(rekod) {
      // Buat masa ini kita paparkan dalam Alert Box kemas.
      // Pada Fasa 5 (Janaan PDF), kita akan tukar ini kepada Modal Cetakan Rasmi.
      alert(`📄 MAKLUMAT KES DISIPLIN\n\nNama Murid: ${rekod.murid}\nTarikh Kes: ${new Date(rekod.tarikh).toLocaleString('ms-MY')}\nKategori: ${rekod.kategori}\n\nLaporan:\n"${rekod.keterangan}"\n\nStatus Semasa: ${rekod.status}`);
    }
  }

  // 5. Mulakan proses tarik data apabila fail dimuatkan
  langganRekodDisiplin();
});
