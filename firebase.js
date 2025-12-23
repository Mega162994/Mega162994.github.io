window.pickPartner = async function (myName) {
  const peopleCol = collection(db, "people");

  try {
    let chosenPartner = null;

    await runTransaction(db, async (transaction) => {
      const myRef = doc(db, "people", myName);
      const mySnap = await transaction.get(myRef);

      if (!mySnap.exists()) {
        throw new Error("User does not exist");
      }

      if (mySnap.data().family === 1) {
        throw new Error("You already picked");
      }

      // 🔒 READ ALL PEOPLE THROUGH TRANSACTION
      const peopleSnap = await transaction.get(peopleCol);

      const available = [];

      peopleSnap.forEach(docSnap => {
        const data = docSnap.data();
        if (
          docSnap.id !== myName &&
          data.locked === false
        ) {
          available.push(docSnap.id);
        }
      });

      if (available.length === 0) {
        throw new Error("No partners left");
      }

      // 🎯 RANDOM PICK
      chosenPartner =
        available[Math.floor(Math.random() * available.length)];

      const partnerRef = doc(db, "people", chosenPartner);
      const partnerSnap = await transaction.get(partnerRef);

      if (partnerSnap.data().locked === true) {
        throw new Error("Partner already locked, retry");
      }

      // ✅ COMMIT
      transaction.update(myRef, {
        family: 1,
        pairedWith: chosenPartner
      });

      transaction.update(partnerRef, {
        locked: true
      });
    });

    alert(`You got ${chosenPartner}`);

  } catch (err) {
    alert(err.message);
  }
};
