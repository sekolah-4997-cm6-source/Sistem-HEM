// js/app.js

import { auth } from "./firebase-config.js";
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberMeCheckbox = document.getElementById("remember-me");
  const btnLogin = document.getElementById("btn-login");
  const errorMessageDiv = document.getElementById("error-message");
  const forgotPasswordLink = document.getElementById("forgot-password");

  // 1. Pengendali Borang Log Masuk (Submit)
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const rememberMe = rememberMeCheckbox.checked;

      // Sembunyikan amaran ralat sebelum pemprosesan
      hideError();
      setLoadingState(true);

      try {
        // Tetapkan tahap ingatan sesi (Local vs Session)
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistenceType);

        // Proses log masuk ke Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Log masuk berjaya:", userCredential.user.email);

        // Beralih ke Papan Pemuka Utama (Admin Dashboard)
        window.location.href = "pages/admin.html";

      } catch (error) {
        setLoadingState(false);
        showError(translateFirebaseError(error.code));
      }
    });
  }

  // 2. Pengendali Lupa Kata Laluan
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      if (!email) {
        showError("Sila masukkan e-mel rasmi anda pada ruang e-mel terlebih dahulu untuk penetapan semula kata laluan.");
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        alert(`Pautan penetapan semula kata laluan telah dihantar ke e-mel: ${email}\nSila semak peti masuk (inbox/spam) anda.`);
      } catch (error) {
        showError("Gagal menghantar e-mel penetapan semula. Sila pastikan e-mel adalah sah.");
      }
    });
  }

  // Fungsi Pembantu: Papar & Sembunyi Ralat
  function showError(message) {
    if (errorMessageDiv) {
      errorMessageDiv.textContent = message;
      errorMessageDiv.classList.remove("hidden");
    }
  }

  function hideError() {
    if (errorMessageDiv) {
      errorMessageDiv.classList.add("hidden");
      errorMessageDiv.textContent = "";
    }
  }

  // Fungsi Pembantu: Kemaskini Keadaan Butang
  function setLoadingState(isLoading) {
    if (btnLogin) {
      if (isLoading) {
        btnLogin.disabled = true;
        btnLogin.textContent = "Sedang Memproses...";
        btnLogin.classList.add("opacity-70", "cursor-not-allowed");
      } else {
        btnLogin.disabled = false;
        btnLogin.textContent = "Log Masuk Ke Sistem";
        btnLogin.classList.remove("opacity-70", "cursor-not-allowed");
      }
    }
  }

  // Terjemahan Kod Ralat Firebase ke Bahasa Melayu
  function translateFirebaseError(code) {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "E-mel atau kata laluan tidak sah. Sila semak semula.";
      case "auth/invalid-email":
        return "Format e-mel tidak sah.";
      case "auth/too-many-requests":
        return "Terlalu banyak percubaan gagal. Sila cuba lagi sebentar lagi.";
      case "auth/network-request-failed":
        return "Tiada sambungan internet. Sila semak rangkaian anda.";
      default:
        return "Gagal log masuk. Sila cuba lagi (" + code + ")";
    }
  }
});
