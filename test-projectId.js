import admin from 'firebase-admin';
async function run() {
  try {
    const defaultCredentials = admin.credential.applicationDefault();
    const projectId = await defaultCredentials.getProjectId();
    console.log("App Default Project ID:", projectId);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
run();
