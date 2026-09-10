// js/components/sidebar.js
import { auth } from "../firebase_config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebar-container");

  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
      <aside class="w-64 bg-slate-800 text-white min-h-screen fixed left-0 top-0 flex flex-col shadow-xl z-40">
        <!-- Logo & Tajuk -->
        <div class="p-6 border-b border-slate-700 flex items-center space-x-3">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-800">
            SK
          </div>
          <div>
            <h2 class="font-bold text-sm tracking-wide">LAKA SELATAN</h2>
            <p class="text-[10px] text-slate-400">Sistem Pengurusan Murid</p>
          </div>
        </div>

        <!-- Menu Navigasi -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
          <a href="admin.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition w-full text-slate-300 hover:text-white">
            <i class="fa-solid fa-chart-pie w-5"></i>
            <span>Papan Pemuka</span>
          </a>
          
          <a href="senarai_murid.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition w-full text-slate-300 hover:text-white">
            <i class="fa-solid fa-users w-5"></i>
            <span>Senarai Murid</span>
          </a>

          <a href="disiplin.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition w-full text-slate-300 hover:text-white">
            <i class="fa-solid fa-scale-balanced w-5"></i>
            <span>Sahsiah & Disiplin</span>
          </a>

          <a href="laporan_bantuan.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition w-full text-slate-300 hover:text-white">
            <i class="fa-solid fa-hand-holding-dollar w-5"></i>
            <span>Kebajikan & Bantuan</span>
          </a>

          <a href="efiling_skas.html" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition w-full text-slate-300 hover:text-white">
            <i class="fa-solid fa-folder-tree w-5"></i>
            <span>e-Filing SK@S</span>
          </a>
        </nav>

        <!-- Log Keluar -->
        <div class="p-4 border-t border-slate-700">
          <button id="btn-logout-sidebar" class="flex items-center space-x-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 w-full transition">
            <i class="fa-solid fa-right-from-bracket w-5"></i>
            <span>Log Keluar</span>
          </button>
        </div>
      </aside>
    `;

    // Panggil event listener terus selepas elemen disuntik ke DOM
    const btnLogout = document.getElementById("btn-logout-sidebar");
    if (btnLogout) {
      btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();
        if (confirm("Adakah anda pasti untuk log keluar sistem?")) {
          try {
            await signOut(auth);
            window.location.href = "../index.html";
          } catch (error) {
            console.error("Ralat log keluar:", error);
            alert("Gagal log keluar: " + error.message);
          }
        }
      });
    }
  }
});
