// Inicialización del SDK de Firebase (Auth con proveedor de Google).
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCOn61bzLVVGthpkrn6t-elrN3zAtIz0aU",
  authDomain: "noteforge-sm2026.firebaseapp.com",
  projectId: "noteforge-sm2026",
  storageBucket: "noteforge-sm2026.firebasestorage.app",
  messagingSenderId: "361041498952",
  appId: "1:361041498952:web:5dd109cdbea577f5d9597d",
  measurementId: "G-B8VT1B0026"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();