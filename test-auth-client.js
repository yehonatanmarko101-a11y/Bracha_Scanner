import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { initializeApp } from "firebase/app";
import admin from "firebase-admin";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

if (!admin.apps.length) {
  admin.initializeApp({ projectId: config.projectId });
}

async function run() {
  const customToken = await admin.auth().createCustomToken('test-uid-1234');
  const auth = getAuth(app);
  await signInWithCustomToken(auth, customToken);
  
  const user = auth.currentUser;
  console.log("Logged in as user:", user.uid);
  
  try {
    const questionData = {
      userId: user.uid,
      text: "Test question?",
      scannedProductInfo: { category: "General", hasPhoto: false },
      status: "pool",
      createdAt: new Date()
    };
    const res = await addDoc(collection(db, "questions"), questionData);
    console.log("addDoc successful", res.id);
  } catch (e) {
    console.error("addDoc failed:", e.message);
  }
  process.exit(0);
}
run();
