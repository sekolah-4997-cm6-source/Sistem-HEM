// js/disiplin.js
import { db } from "./firebase-config.js";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const borangDisiplin = document.getElementById("borang-disiplin");
  const jadualDisiplin = document.getElementById("jadual-disiplin-body");
  
  // Elemen Carian Murid Pintar
  const inputCarian = document.getElementById("carian-murid");
  const senaraiCarian = document.getElementById("senarai-carian-murid");
  const hiddenMuridId = document.getElementById("input-murid-id");
  const hiddenMuridNama = document.getElementById("input-murid-nama");

  let senaraiRekod = [];
  let senaraiSemuaMurid = []; // Untuk simpan master data murid

  // ==========================================
  // FUNGSI 0: TARIK MASTER DATA MURID (UNTUK CARIAN)
  // ==========================================
  async function tarikDataMurid() {
    try {
      const qMurid = query(collection(db, "murid"), orderBy("nama", "asc"));
      const snapshot = await getDocs(qMurid);
      senaraiSemuaMurid = snapshot.docs.map(doc => ({
        id: doc.id,
        nama: doc.data().nama,
        kelas: doc.data().kelas
      }));
    } catch (error) {
      console.error("Ralat menarik data master murid:", error);
    }
  }

  // ==========================================
  // FUNGSI 0.1: LOGIK CARIAN (AUTO-SUGGEST)
  // ==========================================
  if(inputCarian) {
    inputCarian.addEventListener("input", (e) => {
      const kataKunci = e.target.value.toUpperCase();
      senaraiCarian.innerHTML = "";
      hiddenMuridId.value = ""; // Reset ID jika user mula menaip semula
      
      if (kataKunci.length < 2) {
        senaraiCarian.classList.add("hidden");
        return;
      }

      const padanan = senaraiSemuaMurid.filter(m => m.nama.includes(kataKunci));

      if (padanan.length > 0) {
        senaraiCarian.classList.remove("hidden");
        padanan.forEach(m => {
          const li = document.createElement("li");
          li.className = "p-2 hover:bg-slate-100 cursor-pointer border-b border-slate-50";
          li.innerHTML = `<span class="font-bold text-slate-700">${m.nama}</span> <span class="text-slate-400">(${m.kelas})</span>`;
          
          li.addEventListener("click", () => {
            inputCarian.value = m.nama; // Masukkan nama penuh ke input
            hiddenMuridId.value = m.id; // Simpan Document ID
            hiddenMuridNama.value = m.nama; // Simpan Nama Lengkap
            senaraiCarian.classList.add("hidden");
          });
          senaraiCarian.appendChild(li);
        });
      } else {
        senaraiCarian.classList.remove("hidden");
        senaraiCarian.innerHTML = `<li class="p-2 text-slate-400 italic">Tiada padanan.</li>`;
      }
    });

    // Sembunyikan senarai jika klik tempat lain
    document.addEventListener("click", (e) => {
      if(e.target !== inputCarian) senaraiCarian.classList.add("hidden");
    });
  }

  // ==========================================
  // FUNGSI 1: LANGGAN REKOD DISIPLIN (REAL-TIME)
  // ==========================================
  function langganRekodDisiplin() {
    if (!jadualDisiplin) return;
    
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

  // ==========================================
  // FUNGSI 2: PAPAR JADUAL
  // ==========================================
  function renderJadualDisiplin() {
    if (!jadualDisiplin) return;
    jadualDisiplin.innerHTML = "";

    if (senaraiRekod.length === 0) {
      jadualDisiplin.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500 text-xs">Tiada rekod buat masa ini.</td></tr>`;
      return;
    }

    senaraiRekod.forEach((rekod) => {
      let badgeKategori = "";
      if (rekod.kategori === "BERAT") {
        badgeKategori = `<span class="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">🚨 Salah Laku Berat</span>`;
      } else if (rekod.kategori === "PONTENG") {
        badgeKategori = `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">🏃 Ponteng</span>`;
      } else if (rekod.kategori === "AMALAN_BAIK") {
        badgeKategori = `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">🌟 Amalan Baik</span>`;
      } else {
        badgeKategori = `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">⚠️ Sederhana/Ringan</span>`;
      }

      const tarikhFormat = new Date(rekod.tarikh).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
      tr.innerHTML = `
        <td class="p-2 whitespace-nowrap text-[10px] text-slate-500">${tarikhFormat}</td>
        <td class="p-2 font-bold text-slate-800">${rekod.muridNama}</td>
        <td class="p-2">${badgeKategori}</td>
        <td class="p-2 truncate max-w-xs" title="${rekod.keterangan}">${rekod.keterangan}</td>
        <td class="p-2 text-center space-x-1">
          <button onclick="bukaPopupSemakan('${rekod.id}')" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-[10px] font-semibold transition">Lihat</button>
          <button onclick="padamKes('${rekod.id}')" class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-[10px] font-semibold transition"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      jadualDisiplin.appendChild(tr);
    });
  }

  // ==========================================
  // FUNGSI 3: TAMBAH KES BARU
  // ==========================================
  if (borangDisiplin) {
    borangDisiplin.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const muridId = hiddenMuridId.value;
      const muridNama = hiddenMuridNama.value;
      
      if(!muridId) {
        alert("Sila pilih nama murid dari senarai carian (dropdown).");
        return;
      }

      const tarikh = document.getElementById("input-tarikh-kes").value;
      const kategori = document.getElementById("kategori-kes").value;
      const keterangan = document.getElementById("keterangan-kes").value;
      const btnSubmit = borangDisiplin.querySelector("button[type='submit']");
      
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

      try {
        await addDoc(collection(db, "disiplin"), {
          muridId: muridId,
          muridNama: muridNama,
          tarikh: tarikh,
          kategori: kategori,
          keterangan: keterangan,
          status: "Selesai", // Boleh ditukar secara dinamik kelak jika perlukan status Belum Selesai
          timestamp: new Date().toISOString()
        });

        borangDisiplin.reset();
        hiddenMuridId.value = "";
        alert(kategori === "AMALAN_BAIK" ? "Amalan Baik direkodkan!" : "Kes Disiplin telah direkodkan!");
      } catch (error) {
        console.error("Ralat menyimpan kes:", error);
        alert("Gagal menyimpan rekod. Sila semak sambungan internet.");
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-plus mr-1"></i> Simpan Rekod';
      }
    });
  }

  // ==========================================
  // FUNGSI 4: TRACKER KES KRITIKAL (REAL-TIME)
  // ==========================================
  function langganStatistikKritikal() {
    const qSemuaDisiplin = collection(db, "disiplin");
    
    onSnapshot(qSemuaDisiplin, (snapshot) => {
      let jumlahKritikalBelumSelesai = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Mengikut logik di Fungsi 3, salah laku berat disimpan sebagai "BERAT"
        if (data.kategori === "BERAT" && data.status === "Belum Selesai") {
          jumlahKritikalBelumSelesai++;
        }
      });

      const badgeKritikal = document.getElementById("tracker-kes-kritikal");
      
      if (badgeKritikal) {
        if (jumlahKritikalBelumSelesai > 0) {
          badgeKritikal.textContent = `${jumlahKritikalBelumSelesai} Kes Kritikal Belum Selesai`;
          badgeKritikal.style.display = "inline-block"; 
          badgeKritikal.className = "bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full";
        } else {
          badgeKritikal.textContent = `0 Kes Kritikal Belum Selesai`;
          badgeKritikal.className = "bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full";
        }
      }
    });
  }

  // ==========================================
  // FUNGSI GLOBAL UTK BUTTON DALAM JADUAL
  // ==========================================
  window.bukaPopupSemakan = (id) => {
    const rekod = senaraiRekod.find(r => r.id === id);
    if(rekod) {
      alert(`MAKLUMAT KES\n\nNama Murid: ${rekod.muridNama}\nTarikh Kejadian: ${new Date(rekod.tarikh).toLocaleString('ms-MY')}\nKategori: ${rekod.kategori}\n\nLaporan / Tindakan:\n"${rekod.keterangan}"`);
    }
  };

  window.padamKes = async (id) => {
    if(confirm("Adakah anda pasti mahu memadam rekod ini secara kekal?")) {
      try {
        await deleteDoc(doc(db, "disiplin", id));
      } catch(error) {
        alert("Gagal memadam rekod.");
      }
    }
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  tarikDataMurid(); 
  langganRekodDisiplin(); 
  langganStatistikKritikal(); // Mula langgan statistik kritikal
});
