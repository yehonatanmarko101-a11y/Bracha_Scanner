const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const helper = `
async function processImageSafe(base64Str: string): Promise<string> {
    const buffer = Buffer.from(base64Str, 'base64');
    // Reject decompression bombs / too large files (> 5MB handled by body parser)
    const processedBuffer = await sharp(buffer)
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    return processedBuffer.toString('base64');
}
`;
if (!content.includes('async function processImageSafe')) {
    content = content.replace('async function startServer() {', helper + '\nasync function startServer() {');
    
    // Patch /api/ai/draft
    content = content.replace(
      '        const base64Str = photoData.includes(",") ? photoData.split(",")[1] : photoData;',
      '        let base64Str = photoData.includes(",") ? photoData.split(",")[1] : photoData;\n        base64Str = await processImageSafe(base64Str);'
    );
    
    // Patch /api/ai/extract-ingredients
    content = content.replace(
      '      let resolvedMimeType = "image/jpeg";',
      '      let resolvedMimeType = "image/jpeg";\n      base64Data = await processImageSafe(base64Data);'
    );

    // Patch /api/ai/scan
    content = content.replace(
      '      const parts: any[] = [];',
      '      if (base64Data) { base64Data = await processImageSafe(base64Data); }\n      const parts: any[] = [];'
    );
    // In /api/ai/scan, we should also ensure resolvedMimeType is jpeg since processImageSafe outputs jpeg.
    content = content.replace(
      '      if (base64Data.startsWith("iVBOR")) resolvedMimeType = "image/png";',
      '      resolvedMimeType = "image/jpeg";\n      if (false) {'
    );
}

fs.writeFileSync('server.ts', content);
