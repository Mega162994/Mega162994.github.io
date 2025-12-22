// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, runTransaction, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD0mnZTMTDNEIdYbM1mzYQ7PNOCTFwralQ",
  authDomain: "christamas-b7061.firebaseapp.com",
  projectId: "christamas-b7061",
  storageBucket: "christamas-b7061.firebasestorage.app",
  messagingSenderId: "964436369056",
  appId: "1:964436369056:web:770e0cec4ced39c491f3c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to pick a partner
window.pickPartner = async function(myName) {
  const myRef = doc(db, "people", myName);

  await runTransaction(db, async (transaction) => {
    const mySnap = await transaction.get(myRef);

    // Stop if picker already clicked
    if (mySnap.data().locked) {
      alert("Already picked.");
      return;
    }

    // Build available partner list
    const snap = await getDocs(collection(db, "people"));
    const available = [];
    snap.forEach(d => {
      const data = d.data();
      if (!data.locked && d.id !== myName) {
        available.push(d.id);
      }
    });

    if (available.length === 0) {
      alert("No partners left.");
      return;
    }

    // Pick random partner
    const partner = available[Math.floor(Math.random() * available.length)];

    // LOCK ONLY THE PICKER
    transaction.update(myRef, {
      pairedWith: partner,
      locked: true
    });

    alert(`You are paired with ${partner}`);
  });
};
