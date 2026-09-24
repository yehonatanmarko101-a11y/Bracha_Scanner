async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/ask/submit', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "123", text: "what is the bracha on apple?", scannedProductInfo: {} })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch(e) {
    console.error(e);
  }
}
run();
