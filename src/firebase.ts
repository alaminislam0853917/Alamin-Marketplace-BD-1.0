import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAumIYBigMsqANet8kI7jSFTc9YJy4xJnQ",
  authDomain: "alamin-marketplace.firebaseapp.com",
  databaseURL: "https://alamin-marketplace-default-rtdb.firebaseio.com",
  projectId: "alamin-marketplace",
  storageBucket: "alamin-marketplace.firebasestorage.app",
  messagingSenderId: "831366601562",
  appId: "1:831366601562:web:587fdd954952ad41b87163"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
