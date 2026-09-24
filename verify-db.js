import { db } from './src/lib/firebaseAdmin.ts';

async function run() {
  console.log("Checking DB...");
  try {
    const usersRef = await db.collection('users').limit(1).get();
    console.log("Empty?", usersRef.empty);
  } catch (e) {
    console.log("Error:", e.message, e.code);
  }
}
run();
