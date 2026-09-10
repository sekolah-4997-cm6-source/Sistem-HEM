// js/firebase_config.js

// 1. Import Firebase Core & Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; // (Untuk login nanti)

// 2. Masukkan Config Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBzC6gvRgNHgG79cHpVAIUk86XazXdzL1w",
  authDomain: "hem-skfls.firebaseapp.com",
  projectId: "hem-skfls",
  storageBucket: "hem-skfls.firebasestorage.app",
  messagingSenderId: "339815291908",
  appId: "1:339815291908:web:ba4730238a7df1b17c2951"
};

// 3. Initialize Firebase & Export 'db' (INI PALING PENTING UNTUK HILANGKAN RALAT)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
