(async () => {
  const { Jimp } = await import('jimp');
  const imgPath = './src/assets/images/exec-d2904ada-8f8e-4c14-adcc-8888a80ca756.png';
  const img = await Jimp.read(imgPath);
  
  img.cover({ w: 192, h: 192 });
  await img.write('./public/icon-192.png');
  
  const img2 = await Jimp.read(imgPath);
  img2.cover({ w: 512, h: 512 });
  await img2.write('./public/icon-512.png');
  
  console.log("Icons generated.");
})();
