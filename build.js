const fs = require('fs');
const path = require('path');

const IMAGES_DIR = './images';
const OUTPUT_FILE = './data.json';
const METADATA_FILE = './metadata.json';

// Function to get all image and video files from the images directory
function getImageFiles(dir) {
  const files = fs.readdirSync(dir);
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4'];

  return files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    })
    .map(file => path.join(dir, file));
}

// Function to load custom metadata if it exists
function loadCustomMetadata() {
  if (fs.existsSync(METADATA_FILE)) {
    try {
      const content = fs.readFileSync(METADATA_FILE, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('Warning: Could not parse metadata.json, skipping custom metadata');
      return {};
    }
  }
  return {};
}

// Main build function
function build() {
  console.log('🔍 Scanning images directory...');

  const imageFiles = getImageFiles(IMAGES_DIR);
  const customMetadata = loadCustomMetadata();

  console.log(`📸 Found ${imageFiles.length} images`);

  // Create data structure for each image
  const images = imageFiles.map(filePath => {
    const filename = path.basename(filePath);
    const relativePath = filePath.replace('./', '');

    // Check if custom metadata exists for this image
    const custom = customMetadata[filename] || {};

    return {
      id: filename,
      path: relativePath,
      filename: filename,
      title: custom.title || filename.replace(/\.[^/.]+$/, ''), // Remove extension for default title
      description: custom.description || '',
      tags: custom.tags || [],
      category: custom.category || '',
      product: custom.product || '',
      formFactors: custom.formFactors || [],
      features: custom.features || [],
      date: custom.date || null,
      featured: custom.featured || false
    };
  });

  // Sort by date (newest first) if dates exist, otherwise by filename descending
  images.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date) - new Date(a.date);
    }
    // Extract numbers from filename for proper numeric sorting
    const aNum = parseInt(a.filename.match(/\d+/)?.[0] || '0');
    const bNum = parseInt(b.filename.match(/\d+/)?.[0] || '0');

    if (aNum !== bNum) {
      return bNum - aNum; // Descending numeric order
    }
    // Fallback to alphabetical if no numbers or same numbers
    return b.filename.localeCompare(a.filename);
  });

  // Write to data.json
  const output = {
    images: images,
    totalCount: images.length,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`✅ Generated ${OUTPUT_FILE} with ${images.length} images`);
  console.log(`📅 Build completed at ${output.generatedAt}`);
}

// Run the build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
