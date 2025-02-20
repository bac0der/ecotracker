// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAF9RKkHWSuHy9AEE68JJ14BSuHuyoTNk",
  authDomain: "eco-tracker-bot.firebaseapp.com",
  projectId: "eco-tracker-bot",
  storageBucket: "eco-tracker-bot.firebasestorage.app",
  messagingSenderId: "144721844447",
  appId: "1:144721844447:web:2a39b5bd0f059ca98b716a",
  measurementId: "G-5B601LPLP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);