import { admin, db } from "./src/lib/firebaseAdmin.js";
async function test() {
  try {
    console.log("Checking DB connection...", db.databaseId);
    const doc = await db.collection("rate_limits").doc("test").get();
    console.log("Success:", doc.exists);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
