// js/firebase-config.js

// Import Firebase SDK v10 melalui CDN (ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tetapan Konfigurasi Firebase Projek SK (FELDA) LAKA SELATAN
// (Gantikan nilai dalam tanda petik di bawah dengan maklumat dari Firebase Console anda)
const firebaseConfig = {
  apiKey: "API_KEY_ANDA_DI_SINI",
  authDomain: "sk-felda-laka-selatan.firebaseapp.com",
  projectId: "sk-felda-laka-selatan",
  storageBucket: "sk-felda-laka-selatan.appspot.com",
  messagingSenderId: "SENDER_ID_ANDA",
  appId: "APP_ID_ANDA"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export modul untuk diguna pakai dalam fail JS lain
export { app, auth, db };
