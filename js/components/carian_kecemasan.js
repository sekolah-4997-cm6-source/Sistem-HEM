// js/components/carian_kecemasan.js

// Fungsi untuk membuka modal Kad Cemas (Perlu didedahkan kepada global/window)
window.bukaKadCemas = function (namaMurid, kelas, namaWaris, telWaris, namaWaris2, telWaris2, perkapita, kesihatan, alamat) {
  const modal = document.getElementById("modal-carian-cemas");
  const modalContent = document.getElementById("modal-cemas-content");

  if (!modal || !modalContent) return;

  // Format nombor untuk WhatsApp (buang '0' di depan dan tambah '60')
  const waWaris = telWaris.startsWith('0') ? '6' + telWaris : telWaris;

  // Bina struktur HTML Kad Cemas
  modalContent.innerHTML = `
    <!-- Header Modal -->
    <div class="bg-amber-500 p-4 text-white flex justify-between items-start">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm border border-white/30">
          🚨
        </div>
        <div>
          <h2 class="font-bold text-lg leading-tight uppercase">${namaMurid}</h2>
          <p class="text-xs text-amber-100 font-medium">${kelas} | Kesihatan: ${kesihatan || 'Tiada Rekod'}</p>
        </div>
      </div>
      <button onclick="tutupKadCemas()" class="text-white hover:text-amber-100 transition text-xl p-1">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Info Waris Utama -->
    <div class="p-5 bg-slate-50 border-b border-slate-200">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Waris Utama (Panggilan Segera)</p>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p class="font-bold text-slate-800 text-sm uppercase">${namaWaris}</p>
          <p class="text-xs text-slate-500">${telWaris}</p>
        </div>
        <div class="flex space-x-2">
          <a href="tel:${telWaris}" class="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2">
            <i class="fa-solid fa-phone"></i> <span>Call</span>
          </a>
          <a href="https://wa.me/${waWaris}" target="_blank" class="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2">
            <i class="fa-brands fa-whatsapp text-sm"></i> <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Info Tambahan -->
    <div class="p-5 text-xs text-slate-600 space-y-3">
      ${telWaris2 ? `
      <div>
        <span class="font-semibold text-slate-700">Waris Ke-2 (Alternatif):</span> ${namaWaris2} (${telWaris2})
      </div>
      ` : ''}
      <div>
        <span class="font-semibold text-slate-700">Alamat:</span> ${alamat}
      </div>
      <div>
        <span class="font-semibold text-slate-700">Gaji Perkapita:</span> ${perkapita}
      </div>
    </div>
  `;

  // Tunjukkan modal
  modal.classList.remove("hidden");
};

// Fungsi untuk menutup modal
window.tutupKadCemas = function () {
  const modal = document.getElementById("modal-carian-cemas");
  if (modal) {
    modal.classList.add("hidden");
  }
};
