fetch('http://localhost:3000/api/ping').then(res => res.json()).then(console.log).catch(console.error);
