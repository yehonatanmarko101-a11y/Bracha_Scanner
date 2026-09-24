async function checkMetadata() {
  try {
    const res = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email", {
      headers: { "Metadata-Flavor": "Google" }
    });
    const email = await res.text();
    console.log("Service Account Email from Metadata Server:", email);
  } catch (e) {
    console.error("Failed to query metadata server:", e.message);
  }

  try {
    const res2 = await fetch("http://metadata.google.internal/computeMetadata/v1/project/project-id", {
      headers: { "Metadata-Flavor": "Google" }
    });
    const projId = await res2.text();
    console.log("Project ID from Metadata Server:", projId);
  } catch (e) {
    console.error("Failed to query metadata server for project ID:", e.message);
  }
}
checkMetadata();
