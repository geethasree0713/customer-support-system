import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyB5rAOZlt88ls1XCqthP0mE_f-hr6LrnBc",
  authDomain: "supporthub-a25cb.firebaseapp.com",
  projectId: "supporthub-a25cb",
  storageBucket: "supporthub-a25cb.firebasestorage.app",
  messagingSenderId: "302004372550",
  appId: "1:302004372550:web:a60d982f43aedc13647647",
  measurementId: "G-TE3EX7N4DB"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);