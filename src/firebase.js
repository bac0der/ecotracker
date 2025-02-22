const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, orderBy } = require("firebase/firestore");
require("dotenv").config();

const firebaseConfig = {
    apiKey: "AIzaSyAAF9RKkHWSuHy9AEE68JJ14BSuHuyoTNk",
    authDomain: "eco-tracker-bot.firebaseapp.com",
    projectId: "eco-tracker-bot",
    storageBucket: "eco-tracker-bot.firebasestorage.app",
    messagingSenderId: "144721844447",
    appId: "1:144721844447:web:2a39b5bd0f059ca98b716a",
    measurementId: "G-5B601LPLP5"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db, collection, addDoc, getDocs, query, orderBy };
