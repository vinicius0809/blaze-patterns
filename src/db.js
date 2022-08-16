import firebase from 'firebase';
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLB27nWPHbrSNTwBNfaLit1N8Fn-me7j4",
  authDomain: "open-banking-open-source.firebaseapp.com",
  databaseURL: "https://open-banking-open-source-default-rtdb.firebaseio.com",
  projectId: "open-banking-open-source",
  storageBucket: "open-banking-open-source.appspot.com",
  messagingSenderId: "691278522719",
  appId: "1:691278522719:web:0b802ab248c6876adbaeea",
  measurementId: "G-54CBMJRMCP"
  };
const app = firebase.initializeApp(firebaseConfig);
// Get a Firestore instance
export const firestoreDb = app.firestore();
export const realtimeDb = firebase.database();