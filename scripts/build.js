import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { minify } from 'terser';

const JS_DIR = 'js';
const OUTPUT_FILE = 'js/bundle.min.js';
const FILES_TO_BUNDLE = [
  'js/config.js',
  'js/translations.js',
  'js/components.js',
  'js/main.js'
];

async function minifyFile(filePath) {
  const code = await readFile(filePath, 'utf8');
  const result = await minify(code, {
    compress: {
      dead_code: true,
      drop_console: false,
      drop_debugger: true,
      keep_classnames: false,
      keep_fnames: false
    },
    mangle: {
      toplevel: false
    },
    format: {
      comments: false
    }
  });
  return result.code;
}

console.log('📦 Building and minifying JavaScript...\n');

try {
  // Bundle core files
  let bundledCode = '';
  
  for (const file of FILES_TO_BUNDLE) {
    console.log(`  → Minifying ${file}...`);
    const minified = await minifyFile(file);
    bundledCode += minified + '\n';
  }

  // Write bundled file
  await writeFile(OUTPUT_FILE, bundledCode, 'utf8');
  const bundleSize = (Buffer.byteLength(bundledCode, 'utf8') / 1024).toFixed(2);
  console.log(`\n✓ Bundle created: ${OUTPUT_FILE} (${bundleSize} KB)`);

  // Minify standalone files
  console.log('\n📦 Minifying standalone files...\n');
  
  const standaloneFiles = [
    'js/service-form.js',
    'js/pwa.js',
    'js/jobs.js',
    'js/job-detail.js',
    'js/worker-request.js'
  ];

  for (const file of standaloneFiles) {
    try {
      const minified = await minifyFile(file);
      const outputPath = file.replace('.js', '.min.js');
      await writeFile(outputPath, minified, 'utf8');
      const size = (Buffer.byteLength(minified, 'utf8') / 1024).toFixed(2);
      console.log(`  ✓ ${file} → ${outputPath} (${size} KB)`);
    } catch (err) {
      console.log(`  ⚠ Skipped ${file}: ${err.message}`);
    }
  }

  console.log('\n✅ Build complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Update HTML files to use bundle.min.js instead of individual files');
  console.log('   2. For Web3Forms: Get your free access key from https://web3forms.com');
  console.log('   3. Add the key to js/config.js → SITE.web3forms.accessKey');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
