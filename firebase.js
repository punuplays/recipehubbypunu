import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// FIREBASE CONFIGURATION

const firebaseConfig = {
    apiKey: "AIzaSyBn0GIuFT_-8kKDET9qtZHt6jOvWfU-eJ0",
    authDomain: "recipehub-by-puniket.firebaseapp.com",
    projectId: "recipehub-by-puniket",
    storageBucket: "recipehub-by-puniket.firebasestorage.app",
    messagingSenderId: "828651242",
    appId: "1:828651242:web:9893f9a2afd6dabb1fc993"
};

// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// GOOGLE PROVIDER

const googleProvider = new GoogleAuthProvider();

// MAKE FIREBASE FUNCTIONS AVAILABLE TO APP.JS

window.firebaseAuthAPI = {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    googleProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
};

console.log("RecipeHub Firebase connected!");