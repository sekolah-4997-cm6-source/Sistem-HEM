// js/firebase-config.js

// Import Firebase SDK v10 melalui CDN (ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tetapan Konfigurasi Firebase Projek SK (FELDA) LAKA SELATAN
const firebaseConfig = {
  apiKey: "AIzaSyBzC6gvRgNHgG79cHpVAIUk86XazXdzL1w",
  authDomain: "hem-skfls.firebaseapp.com",
  projectId: "hem-skfls",
  storageBucket: "hem-skfls.firebasestorage.app",
  messagingSenderId: "339815291908",
  appId: "1:339815291908:web:ba4730238a7df1b17c2951"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export modul untuk diguna pakai dalam fail JS lain
export { app, auth, db };
