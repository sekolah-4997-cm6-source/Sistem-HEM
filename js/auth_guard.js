// js/auth_guard.js
import { auth } from "./firebase_config.js";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Kawalan Keselamatan (Auth Guard)
  onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.endsWith("index.html") || currentPage === "/" || currentPage.endsWith("Sistem-HEM/"); 

    if (user) {
      if (isLoginPage) {
        window.location.href = "pages/senarai_murid.html";
      }
    } else {
      if (!isLoginPage) {
        window.location.href = "../index.html"; 
      }
    }
  });

  // 2. Fungsi Log Masuk Google
  const btnGoogleLogin = document.getElementById("btn-google-login");
  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener("click", async (e) => {
      e.preventDefault();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Ralat log masuk Google:", error);
        if (error.code === 'auth/unauthorized-domain') {
          alert("Ralat Domain: Sila tambah domain laman web ini di Firebase Console > Authentication > Settings > Authorized Domains.");
        } else {
          alert("Gagal log masuk dengan Google: " + error.message);
        }
      }
    });
  }

});
