import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = query(collection(db, 'users'), where('email', '==', 'yehonatanmarko100@gmail.com'));
  try {
    const snap = await getDocs(q);
    if (snap.empty) { console.log('Empty'); }
    snap.forEach(d => console.log(d.id, d.data()));
  } catch (e) {
    console.log("Client error:", e);
  }
}
run();
