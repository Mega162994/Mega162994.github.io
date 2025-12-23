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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.pickPartner = async function(myName) {
  try {
    // 1️⃣ Read all people OUTSIDE transaction
    const peopleSnap = await getDocs(collection(db, "people"));

    let meRef, meData;
    const available = [];

    peopleSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (docSnap.id === myName) {
        meRef = docSnap.ref;
        meData = data;
      } else if (!data.locked) {
        available.push(docSnap.id);
      }
    });

    if (!meData) throw new Error("User not found");
    if (meData.family === 1) throw new Error("Already picked");
    if (available.length === 0) throw new Error("No partners left");

    // 2️⃣ Pick random partner
    const chosenPartner = available[Math.floor(Math.random() * available.length)];
    const partnerRef = doc(db, "people", chosenPartner);

    // 3️⃣ Transaction: update picker and lock partner
    await runTransaction(db, async (transaction) => {
      const partnerSnap = await transaction.get(partnerRef);

      if (!partnerSnap.exists() || partnerSnap.data().locked === true) {
        throw new Error("Partner already locked, retry");
      }

      transaction.update(meRef, {
        family: 1,
        pairedWith: chosenPartner
      });

      transaction.update(partnerRef, {
        locked: true
      });
    });

    alert(`🎁 You are paired with ${chosenPartner}`);

  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
};
