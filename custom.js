import admin from "firebase-admin";
import serviceAccount from "./fuck.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore(); // firestore

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}


const setUserClaims = async (uid, role) => {
  console.log(`>> set claims: for=${uid} role=${role}`)
  let user = await admin.auth().getUser(uid)
  const before = user["customClaims"]
  const claims = {};
  claims['role'] = role;
  await admin.auth().setCustomUserClaims(uid, claims);
  user = await admin.auth().getUser(uid)
  console.log(`>> set claims done. \n\tprev=${JSON.stringify(before)} \n\tnext=${JSON.stringify(user["customClaims"])}`)
  return user
}

const USER_IDS = []

// driver, expeditor, carrier
const role = "driver"

for (let uid of USER_IDS){
  co
  const user = await setUserClaims(uid, role)
  if (role === "driver") {
    const email = user.email;
    const driversCollection = db.collection("drivers");
    const snapshot = await driversCollection.where("userid", "==", uid).limit(1).get();
    let driverDocRef;
    let driverActualId;
    // fuck
    // save or update the driver
    if (!snapshot.empty) {
      driverDocRef = snapshot.docs[0].ref;
      const prevDriver = snapshot.docs[0].data()
      const driverData = {
        IIN: email,
        name: email,
        userid: uid,
      }
      await driverDocRef.update(driverData);
      driverActualId = snapshot.docs[0].data().id
      console.log(`>> updated driver doc: ${driverDocRef.id}. \n\tprev=${JSON.stringify(prevDriver)} \n\tnext=${JSON.stringify(driverData)}`);
    } else {
      const genDriverID = uuidv4()
      const driverData = {
        IIN: email,
        name: email,
        userid: uid,
        id: genDriverID
      }
      driverDocRef = await driversCollection.add(driverData);
      driverActualId = genDriverID
      console.log(`>> created new driver doc: ${driverDocRef.id}. \n\tdata=${JSON.stringify(driverData)}`);
    }

    // link driver to company
    console.log(`>> create new company-driver link for ${driverActualId}`);
    const companyDriversCollection = db.collection("company_drivers");

    const linkSnapshot = await companyDriversCollection
      .where("companyid", "==", "some-id-1")
      .where("driverid", "==", driverActualId)
      .limit(1)
      .get();

    const data = {
      companyid: "some-id-1",
      driverid: driverActualId,
    };

    if (!linkSnapshot.empty) {
      const existingDoc = linkSnapshot.docs[0];
      const prevState = existingDoc.data() 
      await existingDoc.ref.update(data);
      console.log(`>> updated existing link, doc id: ${existingDoc.id}. \n\tprev=${JSON.stringify(prevState)} \n\tnext=${JSON.stringify(data)}`);
    } else {
      const newDocRef = await companyDriversCollection.add(data);
      console.log(`>> created new company-driver link, doc id: ${newDocRef.id}. \n\tdata=${JSON.stringify(data)}`);
    }
  }
}
