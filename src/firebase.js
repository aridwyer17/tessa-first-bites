import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBQ2gTwXjYHNWPxtQoKXVpEHkpIvtTo7nw",
  authDomain: "tessa-first-bites.firebaseapp.com",
  databaseURL: "https://tessa-first-bites-default-rtdb.firebaseio.com",
  projectId: "tessa-first-bites",
  storageBucket: "tessa-first-bites.firebasestorage.app",
  messagingSenderId: "54233822437",
  appId: "1:54233822437:web:e9e7f30205c591558f100c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, onValue };
