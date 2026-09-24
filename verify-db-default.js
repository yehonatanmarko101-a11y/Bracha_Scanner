import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({ projectId: config.projectId });
}
const db = getFirestore(admin.app(), '(default)');

async function run() {
  console.log("Checking DB (default)...");
  try {
    const usersRef = await db.collection('users').limit(1).get();
    console.log("Empty?", usersRef.empty);
  } catch (e) {
    console.log("Error:", e.message, e.code);
  }
}
run();
