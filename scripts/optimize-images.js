import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const maxWidth = 1920;
const quality = 85;

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!imageExtensions.includes(ext)) return;

  try {
    const stats = await stat(filePath);
    const sizeBefore = (stats.size / 1024).toFixed(2);

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Resize if too large
    if (metadata.width > maxWidth) {
      image.resize(maxWidth, null, { withoutEnlargement: true });
    }

    // Optimize based on format
    if (ext === '.png') {
      await image.png({ quality, compressionLevel: 9 }).toFile(filePath + '.tmp');
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await image.jpeg({ quality, mozjpeg: true }).toFile(filePath + '.tmp');
    } else if (ext === '.webp') {
      await image.webp({ quality }).toFile(filePath + '.tmp');
    }

    // Replace original
    const { rename, unlink } = await import('fs/promises');
    await unlink(filePath);
    await rename(filePath + '.tmp', filePath);

    const statsAfter = await stat(filePath);
    const sizeAfter = (statsAfter.size / 1024).toFixed(2);
    const saved = ((1 - statsAfter.size / stats.size) * 100).toFixed(1);

    console.log(`✓ ${filePath}: ${sizeBefore}KB → ${sizeAfter}KB (saved ${saved}%)`);
  } catch (error) {
    console.error(`✗ Error optimizing ${filePath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await processDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      await optimizeImage(fullPath);
    }
  }
}

console.log('🖼️  Starting image optimization...\n');
await processDirectory('.');
console.log('\n✅ Image optimization complete!');
