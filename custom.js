import admin from "firebase-admin";
import serviceAccount from "./fuck.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let user = await admin.auth().getUser("<user-id>")
console.log(user)
const claims = {};
claims['role'] = 'driver';
