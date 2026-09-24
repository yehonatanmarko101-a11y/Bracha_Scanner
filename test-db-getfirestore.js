import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = 'gen-lang-client-0503626168';
const databaseId = 'remixed-firestore-database-id';

console.log("Initializing admin...");
if (!admin.apps.length) {
  admin.initializeApp({
    projectId
  });
}

// In firebase-admin, to get a reference to a named database, use getFirestore(app, databaseId)
const db = getFirestore(admin.app(), databaseId);

async function run() {
  try {
    const list = await db.collection('users').limit(1).get();
    console.log("Success! Read docs count:", list.size);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
