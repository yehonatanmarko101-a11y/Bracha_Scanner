import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
// Test WITHOUT databaseId
const dbDefault = getFirestore(app);
// Test WITH databaseId
const dbCustom = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  console.log("Testing dbDefault...");
  try {
    await getDocs(query(collection(dbDefault, 'users'), where('email', '==', 'yehonatanmarko100@gmail.com')));
    console.log("dbDefault: SUCCESS");
  } catch (e) { console.log("dbDefault error:", e.code || e.message); }

  console.log("Testing dbCustom...");
  try {
    await getDocs(query(collection(dbCustom, 'users'), where('email', '==', 'yehonatanmarko100@gmail.com')));
    console.log("dbCustom: SUCCESS");
  } catch (e) { console.log("dbCustom error:", e.code || e.message); }
}
run();
