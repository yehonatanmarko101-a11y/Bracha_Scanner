import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

const databaseId = 'remixed-firestore-database-id';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0503626168'
  });
}

const db = getFirestore(admin.app(), databaseId);

async function run() {
  try {
    const usersRef = await db.collection('users').where('email', '==', 'yehonatanmarko100@gmail.com').get();
    if (usersRef.empty) {
      console.log("No user found with that email!");
    } else {
      let uid;
      usersRef.forEach(d => {
        uid = d.id;
        console.log(d.id, "=>", d.data());
      });

      // Update to admin manually
      await db.collection('users').doc(uid).update({ role: 'admin' });
      console.log("Forced update to admin.");
    }
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
