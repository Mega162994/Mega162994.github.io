import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// List of all people IDs in Firestore
const peopleList = ["Rinshad","Zaynu","Kaizu","Zaru","Chinju",
                    "Prashant","Lakshmi","Tanu","Mayu",
                    "Ashik","Sumi","Ramin","Isha",
                    "Chandu","Bagavath","Unii","Priya"];

window.pickPartner = async function(myName) {
  try {
    let chosenPartner = null;

    await runTransaction(db, async (transaction) => {
      // 1️⃣ Load all people individually inside transaction
      const allPeople = [];
      for (const id of peopleList) {
        const ref = doc(db, "people", id);
        const snap = await transaction.get(ref);
        if (!snap.exists()) throw new Error(`Person ${id} does not exist`);
        allPeople.push({ id, ref, data: snap.data() });
      }

      // 2️⃣ Get picker
      const me = allPeople.find(p => p.id === myName);
      if (me.data.family === 1) throw new Error("You already picked");

      // 3️⃣ Build available partners
      const available = allPeople.filter(p => p.id !== myName && p.data.locked === false);

      if (available.length === 0) throw new Error("No partners left");

      // 4️⃣ Random pick
      const partnerObj = available[Math.floor(Math.random() * available.length)];
      chosenPartner = partnerObj.id;

      // 5️⃣ Commit changes
      transaction.update(me.ref, {
        family: 1,
        pairedWith: chosenPartner
      });

      transaction.update(partnerObj.ref, {
        locked: true
      });
    });

    alert(`🎁 You are paired with ${chosenPartner}`);

  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
};
