import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  runTransaction,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD0mnZTMTDNEIdYbM1mzYQ7PNOCTFwralQ",
  authDomain: "christamas-b7061.firebaseapp.com",
  projectId: "christamas-b7061",
  storageBucket: "christamas-b7061.firebasestorage.app",
  messagingSenderId: "964436369056",
  appId: "1:964436369056:web:770e0cec4ced39c491f3c5"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎁 PICK PARTNER FUNCTION
window.pickPartner = async function (myName) {
  try {
    let chosenPartner = null;

    await runTransaction(db, async (transaction) => {
      const peopleCol = collection(db, "people");

      // 🔒 Read ALL people inside transaction
      const peopleSnap = await transaction.get(peopleCol);

      const myRef = doc(db, "people", myName);
      const mySnap = await transaction.get(myRef);

      if (!mySnap.exists()) {
        throw new Error("User does not exist");
      }

      // ❌ Already picked
      if (mySnap.data().family === 1) {
        throw new Error("You already picked");
      }

      // 🎯 Build available pool
      const available = [];

      peopleSnap.forEach(docSnap => {
        const data = docSnap.data();

        if (
          docSnap.id !== myName &&     // ❌ no self-pick
          data.locked === false        // ❌ can't pick locked
        ) {
          available.push(docSnap.id);
        }
      });

      if (available.length === 0) {
        throw new Error("No partners left");
      }

      // 🎲 Random pick
      chosenPartner =
        available[Math.floor(Math.random() * available.length)];

      const partnerRef = doc(db, "people", chosenPartner);
      const partnerSnap = await transaction.get(partnerRef);

      // 🔁 Final safety check
      if (!partnerSnap.exists() || partnerSnap.data().locked === true) {
        throw new Error("Partner already taken, retry");
      }

      // ✅ COMMIT CHANGES
      transaction.update(myRef, {
        family: 1,
        pairedWith: chosenPartner
      });

      transaction.update(partnerRef, {
        locked: true
      });
    });

    alert(`🎁 You are paired with ${chosenPartner}`);

  } catch (err) {
    alert(err.message);
    console.error(err);
  }
};
