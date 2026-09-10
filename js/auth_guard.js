// js/auth_guard.js

import { auth } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Menyemak status log masuk pengesahan Firebase secara automatik
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Jika tidak log masuk, bawa kembali ke Halaman Log Masuk (index.html)
    console.warn("Akses ditolak: Pengguna belum log masuk.");
    
    // Menyemak kedudukan direktori halaman
    const isInsidePagesFolder = window.location.pathname.includes("/pages/");
    window.location.href = isInsidePagesFolder ? "../index.html" : "index.html";
  } else {
    console.log("Pengguna disahkan log masuk:", user.email);
  }
});

// Fungsi Log Keluar Global (Boleh dipanggil dari menu Sidebar nanti)
export async function handleLogout() {
  try {
    await signOut(auth);
    alert("Anda telah berjaya log keluar.");
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Ralat semasa log keluar:", error);
  }
}

// Jadikan fungsi logout boleh dicapai melalui window
window.logout = handleLogout;
