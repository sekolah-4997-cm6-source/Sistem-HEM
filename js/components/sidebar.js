// js/components/sidebar.js

export function initSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) return;

  sidebarContainer.innerHTML = `
    <aside class="w-64 bg-slate-700 text-slate-100 flex flex-col h-screen fixed shadow-xl z-20 left-0 top-0">
      
      <!-- Profil Sistem & Logo -->
      <div class="p-5 border-b border-slate-600 flex items-center space-x-3">
        <div class="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-xl shadow-inner border border-slate-500">
          🏫
        </div>
        <div>
          <div class="font-bold text-sm tracking-wide">HE@S DIGITAL</div>
          <div class="text-[10px] text-slate-400 uppercase tracking-widest">SK (F) Laka Selatan</div>
        </div>
      </div>

      <!-- Pautan Navigasi -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1 mt-2">
        <a href="admin.html" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-slate-800 text-white font-medium shadow-sm border-l-4 border-slate-400">
          <i class="fa-solid fa-chart-pie w-5"></i> <span>Papan Pemuka</span>
        </a>
        <a href="senarai_murid.html" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-600 text-slate-300 transition">
          <i class="fa-solid fa-users w-5"></i> <span>Profil Induk Murid</span>
        </a>
        <a href="disiplin.html" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-600 text-slate-300 transition">
          <i class="fa-solid fa-scale-balanced w-5"></i> <span>Disiplin & Sahsiah</span>
        </a>
        <a href="#" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-600 text-slate-300 transition">
          <i class="fa-solid fa-hand-holding-heart w-5"></i> <span>Kebajikan & Bantuan</span>
        </a>
        <a href="efiling_skas.html" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-600 text-slate-300 transition">
          <i class="fa-solid fa-folder-open w-5"></i> <span>e-Filing SK@S</span>
        </a>
      </nav>

      <!-- Butang Log Keluar -->
      <div class="p-4 border-t border-slate-600">
        <button onclick="window.logout()" class="flex items-center justify-center space-x-2 px-3 py-2.5 w-full rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition duration-200">
          <i class="fa-solid fa-right-from-bracket"></i> <span class="text-sm font-medium">Log Keluar</span>
        </button>
      </div>
    </aside>
  `;
}

// Auto-run apabila DOM siap diisi
document.addEventListener("DOMContentLoaded", initSidebar);
