
const sharp = require('sharp');
const path = require('path');

async function processIcon() {
  const inputPath = path.join(__dirname, 'public', 'logo.png');
  const outputPath = path.join(__dirname, 'public', 'icon.png');
  const faviconPath = path.join(__dirname, 'src', 'app', 'icon.png');

  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`Dimensions: ${metadata.width}x${metadata.height}`);
    
    const size = Math.max(metadata.width, metadata.height);
    
    // Create a square icon with original logo centered, no distortion
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
      
    // Also copy to src/app/icon.png for Next.js convention
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(faviconPath);

    console.log('Processed icon successfully');
  } catch (err) {
    console.error('Error processing icon:', err);
  }
}

processIcon();
