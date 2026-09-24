for (const k in process.env) {
  if (k.includes("GOOGLE") || k.includes("FIREBASE") || k.includes("GCP") || k.includes("CREDENTIALS")) {
    console.log(k, "=", process.env[k]);
  }
}
