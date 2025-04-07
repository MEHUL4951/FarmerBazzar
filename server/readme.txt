// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpb2LZG4K9SwBtLcjPgUIVMgu9T-9Q3Ss",
  authDomain: "farmer-bazzar.firebaseapp.com",
  projectId: "farmer-bazzar",
  storageBucket: "farmer-bazzar.firebasestorage.app",
  messagingSenderId: "947822862899",
  appId: "1:947822862899:web:e3cbc377c4a604d0313946",
  measurementId: "G-K189DEZCWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


