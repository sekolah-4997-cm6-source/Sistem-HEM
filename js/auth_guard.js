// js/auth_guard.js
import { auth } from "./firebase_config.js";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. SISTEM KAWALAN KESELAMATAN (AUTH GUARD)
  onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname;
    // Kenal pasti jika pengguna berada di halaman login utama
    const isLoginPage = currentPage.endsWith("index.html") || currentPage === "/" || currentPage.endsWith("Sistem-HEM/"); 

    if (user) {
      console.log("Pengguna aktif:", user.email);
      // Jika pengguna dah log masuk tapi buka halaman login, bawa terus ke sistem
      if (isLoginPage) {
        window.location.href = "pages/senarai_murid.html"; // Tukar path jika perlu
      }
    } else {
      // Jika belum log masuk dan cuba curi masuk halaman dalam, tendang keluar
      if (!isLoginPage) {
        window.location.href = "../index.html"; 
      }
    }
  });

  // 2. FUNGSI LOG MASUK GOOGLE (Hanya wujud di index.html)
  const btnGoogleLogin = document.getElementById("btn-google-login");
  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("Berjaya log masuk sebagai:", result.user.displayName);
        // Auth Guard di atas akan automatik alihkan pengguna selepas berjaya
      } catch (error) {
        console.error("Ralat log masuk Google:", error);
        alert("Gagal log masuk: " + error.message);
      }
    });
  }

  // 3. FUNGSI LOG KELUAR (Diikat pada Sidebar merata halaman)
  // Kita guna 'document.body' supaya butang yang di-generate dari sidebar.js dapat dikesan
  document.body.addEventListener("click", async (e) => {
    const btnLogout = e.target.closest("#btn-logout-sidebar");
    
    if (btnLogout) {
      e.preventDefault();
      if (confirm("Adakah anda pasti untuk log keluar sistem?")) {
        try {
          await signOut(auth);
          // Auth Guard akan automatik tendang pengguna ke halaman log masuk
        } catch (error) {
          console.error("Ralat log keluar:", error);
        }
      }
    }
  });

});
