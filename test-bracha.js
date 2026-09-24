import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp({ projectId: 'brachascanner' });
const db = getFirestore(admin.app());
db.settings({ databaseId: 'remixed-firestore-database-id' });

async function run() {
  try {
    const res = await db.collection('users').get();
    console.log("Success with brachascanner!", res.empty);
  } catch (e) {
    console.log("brachascanner failed:", e.message);
  }
}
run();
