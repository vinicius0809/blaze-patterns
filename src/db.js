import firebase from 'firebase/app';
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLB27nWPHbrSNTwBNfaLit1N8Fn-me7j4",
  authDomain: "open-banking-open-source.firebaseapp.com",
  projectId: "open-banking-open-source",
  storageBucket: "open-banking-open-source.appspot.com",
  messagingSenderId: "691278522719",
  appId: "1:691278522719:web:5e32f234fb907d76dbaeea",
  measurementId: "G-47842PXB6F"
  };
// Get a Firestore instance
const app = firebase.initializeApp(firebaseConfig);
export const db = app.firestore();