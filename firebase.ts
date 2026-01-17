
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA1dOqowN6zPTIrk4A-7ckTl325bQgVGyI",
  authDomain: "aminedotink.firebaseapp.com",
  databaseURL: "https://aminedotink-default-rtdb.firebaseio.com",
  projectId: "aminedotink",
  storageBucket: "aminedotink.firebasestorage.app",
  messagingSenderId: "154560363228",
  appId: "1:154560363228:web:816e2fdceab20ebcc45219",
  measurementId: "G-4CRJBVPTQM"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
