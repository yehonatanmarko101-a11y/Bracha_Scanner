import admin from 'firebase-admin';

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'brachascanner';
const databaseId = 'remixed-firestore-database-id';

if (!admin.apps.length) {
  admin.initializeApp({ projectId });
}

const db = admin.firestore();
db.settings({ databaseId });

async function run() {
  try {
    await db.collection('users').doc('nonexistent_test_doc_id_123').get();
    console.log("Success reading nonexistent doc! (Which means DB/connection is perfect.)");
  } catch(e) {
    console.log("Error properties:");
    console.log("message:", e.message);
    console.log("code:", e.code);
    console.log("details:", e.details);
    console.log("metadata:", e.metadata);
  }
}
run();
