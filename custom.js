import admin from "firebase-admin";
import serviceAccount from "./fuck.json" with { type: "json" };

const USERID = "sjGhOhzg01WODQLGPKcndX4hmZG2"
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let user = await admin.auth().getUser(USERID)
console.log("claims before:", user["customClaims"])
const claims = {};
claims['role'] = 'driver';

await admin.auth().setCustomUserClaims(USERID, claims);
user = await admin.auth().getUser(USERID)
console.log("claims after:", user["customClaims"])
