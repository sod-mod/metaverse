#!/usr/bin/env node

/**
 * Upload images to Cloudflare R2 using Cloudflare REST API
 * 
 * Prerequisites:
 * 1. Create R2 API Token (not S3 API token) from Cloudflare Dashboard
 * 2. Set environment variables:
 *    - CLOUDFLARE_R2_API_TOKEN: Your R2 API token
 *    - VITE_CLOUDFLARE_R2_ACCOUNT_ID: Your Cloudflare Account ID
 *    - VITE_CLOUDFLARE_R2_BUCKET_NAME: Your R2 bucket name
 * 
 * Usage:
 *   node tools/upload-images.cjs
 *   node tools/upload-images.cjs --dry-run
 *   node tools/upload-images.cjs --bucket=my-bucket-name
 */

// Load environment variables from .env file
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const bucketArg = args.find(arg => arg.startsWith('--bucket='));
const bucketName = bucketArg 
  ? bucketArg.split('=')[1] 
  : process.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || 'multiverse-wiki-images';

const accountId = process.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_R2_API_TOKEN;

const imagesDir = path.join(__dirname, '..', 'public', 'images');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function error(message) {
  console.error(`❌ ${message}`);
}

function checkPrerequisites() {
  // Check if API token is set
  if (!apiToken) {
    error('CLOUDFLARE_R2_API_TOKEN environment variable is not set');
    console.error('   Create an R2 API token from: https://dash.cloudflare.com/<account-id>/r2/api-tokens');
    console.error('   Git Bash/WSL: export CLOUDFLARE_R2_API_TOKEN=your_token');
    console.error('   Windows CMD: set CLOUDFLARE_R2_API_TOKEN=your_token');
    console.error('   Windows PowerShell: $env:CLOUDFLARE_R2_API_TOKEN="your_token"');
    process.exit(1);
  }

  // Check if account ID is set
  if (!accountId) {
    error('VITE_CLOUDFLARE_R2_ACCOUNT_ID environment variable is not set');
    console.error('   Git Bash/WSL: export VITE_CLOUDFLARE_R2_ACCOUNT_ID=your_account_id');
    console.error('   Windows CMD: set VITE_CLOUDFLARE_R2_ACCOUNT_ID=your_account_id');
    console.error('   Windows PowerShell: $env:VITE_CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"');
    process.exit(1);
  }

  // Check if images directory exists
  if (!fs.existsSync(imagesDir)) {
    error(`Images directory not found: ${imagesDir}`);
    process.exit(1);
  }

  log('✅ Prerequisites check passed');
}

/**
 * Get all files recursively from a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Upload a single file to R2 using REST API
 */
function uploadFile(filePath, relativePath) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    // Determine content type
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes = {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.json': 'application/json',
      '.md': 'text/markdown',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    // R2 REST API endpoint
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${relativePath}`;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': contentType,
        'Content-Length': fileContent.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, file: relativePath });
        } else {
          reject(new Error(`Upload failed for ${relativePath}: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(fileContent);
    req.end();
  });
}

/**
 * Upload all images
 */
async function uploadImages() {
  log(`Starting upload to bucket: ${bucketName}`);
  log(`Account ID: ${accountId}`);
  
  if (dryRun) {
    log('🔍 DRY RUN MODE - No files will be uploaded');
  }

  // Get all files
  const allFiles = getAllFiles(imagesDir);
  const relativeFiles = allFiles.map(file => {
    const relativePath = path.relative(imagesDir, file).replace(/\\/g, '/');
    return { fullPath: file, relativePath: `images/${relativePath}` };
  });

  log(`Found ${relativeFiles.length} files to upload`);

  if (dryRun) {
    log('\nFiles that would be uploaded:');
    relativeFiles.forEach(({ relativePath }) => {
      console.log(`  - ${relativePath}`);
    });
    return;
  }

  // Upload files
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (const { fullPath, relativePath } of relativeFiles) {
    try {
      await uploadFile(fullPath, relativePath);
      successCount++;
      if (successCount % 10 === 0) {
        log(`Progress: ${successCount}/${relativeFiles.length} files uploaded...`);
      }
    } catch (err) {
      failCount++;
      errors.push({ file: relativePath, error: err.message });
      error(`Failed to upload ${relativePath}: ${err.message}`);
    }
  }

  log(`\n✅ Upload completed`);
  log(`   Success: ${successCount}`);
  log(`   Failed: ${failCount}`);

  if (errors.length > 0) {
    log('\nErrors:');
    errors.forEach(({ file, error }) => {
      console.error(`  - ${file}: ${error}`);
    });
  }
}

function main() {
  console.log('🚀 Cloudflare R2 Image Upload Tool (REST API)\n');
  
  checkPrerequisites();
  uploadImages().catch((err) => {
    error('Upload process failed');
    console.error(err);
    process.exit(1);
  });
}

main();
