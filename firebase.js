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
  const snap = await getDocs(collection(db, "people"));
  const available = [];

  snap.forEach(d => {
    const data = d.data();
    // Exclude self and anyone already locked
    if (!data.locked && d.id !== myName) {
      available.push(d.id);
    }
  });

  if (available.length === 0) {
    alert("No partners left.");
    return;
  }

  // Pick random partner
  const partnerName = available[Math.floor(Math.random() * available.length)];
  const partnerRef = doc(db, "people", partnerName);

  // Lock the partner, not the picker
  await runTransaction(db, async (transaction) => {
    transaction.update(partnerRef, {
      locked: true,
      pairedWith: myName
    });
  });

  alert(`You picked ${partnerName} as your partner!`);
};
