// js/efiling_skas.js

document.addEventListener("DOMContentLoaded", () => {
  const folderCards = document.querySelectorAll(".folder-card");
  const tajukFolder = document.getElementById("tajuk-folder-aktif");
  const jadualFailBody = document.getElementById("jadual-fail-body");
  const searchFail = document.getElementById("search-fail");

  const btnMuatNaik = document.getElementById("btn-muat-naik");
  const btnTutupUpload = document.getElementById("btn-tutup-upload");
  const modalUpload = document.getElementById("modal-upload");
  const formUpload = document.getElementById("form-upload-evidens");

  let standardAktif = "S1";

  // Data Contoh Fail Evidens
  let senaraiFail = [
    { id: 1, nama: "Minit Mesyuarat Pengurusan Bil 1/2026", standard: "S1", tarikh: "2026-08-15", saiz: "1.2 MB", url: "#" },
    { id: 2, nama: "Borang Penilaian Prestasi Staf 2026", standard: "S2", tarikh: "2026-07-20", saiz: "850 KB", url: "#" },
    { id: 3, nama: "Laporan Pelaksanaan Program RMT", standard: "S3", tarikh: "2026-09-02", saiz: "2.4 MB", url: "#" },
    { id: 4, nama: "Rekod Pencerapan Guru Sem 1", standard: "S4", tarikh: "2026-06-11", saiz: "1.8 MB", url: "#" },
    { id: 5, nama: "Perancangan Strategik Sekolah 2026-2028", standard: "S1", tarikh: "2026-01-10", saiz: "4.5 MB", url: "#" }
  ];

  const tajukStandardMap = {
    "S1": "Standard 1 (Kepimpinan)",
    "S2": "Standard 2 (Pengurusan Organisasi)",
    "S3": "Standard 3 (Kurikulum, Koku & HEM)",
    "S4": "Standard 4 (PdPC Guru)"
  };

  function renderJadualFail() {
    jadualFailBody.innerHTML = "";
    const keyword = searchFail.value.toLowerCase();

    const failTapis = senaraiFail.filter(f => 
      f.standard === standardAktif && f.nama.toLowerCase().includes(keyword)
    );

    if (failTapis.length === 0) {
      jadualFailBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500 text-xs">Tiada fail eviden disimpan dalam folder ini.</td></tr>`;
      return;
    }

    failTapis.forEach((fail) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
      tr.innerHTML = `
        <td class="p-3 font-semibold text-slate-800 flex items-center space-x-2">
          <i class="fa-solid fa-file-pdf text-red-500 text-sm"></i>
          <span>${fail.nama}</span>
        </td>
        <td class="p-3"><span class="bg-slate-100 font-bold text-slate-600 px-2 py-0.5 rounded text-[10px]">${fail.standard}</span></td>
        <td class="p-3 text-slate-500 text-[11px]">${fail.tarikh}</td>
        <td class="p-3 text-slate-500 text-[11px]">${fail.saiz}</td>
        <td class="p-3 text-center space-x-2">
          <a href="${fail.url}" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-[10px] font-semibold transition inline-block" title="Muat Turun">
            <i class="fa-solid fa-download"></i>
          </a>
          <button class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-[10px] font-semibold transition" title="Padam">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      jadualFailBody.appendChild(tr);
    });
  }

  // Tukar Folder
  folderCards.forEach(card => {
    card.addEventListener("click", () => {
      standardAktif = card.getAttribute("data-standard");
      tajukFolder.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500 mr-2"></i> Senarai Fail: ${tajukStandardMap[standardAktif]}`;
      renderJadualFail();
    });
  });

  // Modal Control
  btnMuatNaik.addEventListener("click", () => modalUpload.classList.remove("hidden"));
  btnTutupUpload.addEventListener("click", () => modalUpload.classList.add("hidden"));

  // Form Submit
  formUpload.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("upload-nama").value;
    const std = document.getElementById("upload-standard").value;
    const fileInput = document.getElementById("upload-file");

    const failBaru = {
      id: senaraiFail.length + 1,
      nama: nama,
      standard: std,
      tarikh: new Date().toISOString().split('T')[0],
      saiz: fileInput.files[0] ? `${(fileInput.files[0].size / 1024 / 1024).toFixed(1)} MB` : "1.0 MB",
      url: "#"
    };

    senaraiFail.unshift(failBaru);
    standardAktif = std;
    tajukFolder.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500 mr-2"></i> Senarai Fail: ${tajukStandardMap[standardAktif]}`;
    
    renderJadualFail();
    formUpload.reset();
    modalUpload.classList.add("hidden");
    alert("Evidens berjaya dimuat naik ke dalam e-Filing!");
  });

  searchFail.addEventListener("input", renderJadualFail);

  // Initial Load
  renderJadualFail();
});
