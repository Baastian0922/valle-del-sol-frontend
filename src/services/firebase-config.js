import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PEGA AQUÍ TU CONFIGURACIÓN DIRECTAMENTE DESDE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAzsETw8IjVNjgXiSp3oFIETi6goTANctI",
    authDomain: "valledelsol.firebaseapp.com",
    projectId: "valledelsol",
    storageBucket: "valledelsol.firebasestorage.app",
    messagingSenderId: "304787708950",
    appId: "1:304787708950:web:9850321e66453134b86937",
    measurementId: "G-QG4EH59C1Z"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
// Exportamos Auth y Base de Datos
export const auth = getAuth(app);
export const db = getFirestore(app);
