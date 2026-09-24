import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  const userDocRef = doc(db, "users", "someuid");
  try {
    const d = await getDoc(userDocRef);
    console.log("exists", d.exists());
  } catch (e) {
    console.error("GET error", e);
  }
}
test();
