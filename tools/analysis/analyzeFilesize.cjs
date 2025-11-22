const fs = require('fs');
const path = require('path');

/**
 * Analyze file sizes in multiverse-wiki directory
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getDirectorySize(dirPath, excludeDirs = ['node_modules', '.git', 'dist']) {
  let totalSize = 0;
  const fileList = [];
  
  function walkDir(currentPath, relativePath = '') {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const relativeItemPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      // Skip excluded directories
      if (stat.isDirectory()) {
        if (excludeDirs.includes(item)) {
          continue;
        }
        walkDir(fullPath, relativeItemPath);
      } else {
        totalSize += stat.size;
        fileList.push({
          path: relativeItemPath,
          fullPath: fullPath,
          size: stat.size,
          ext: path.extname(item).toLowerCase() || '(no ext)'
        });
      }
    }
  }
  
  walkDir(dirPath);
  return { totalSize, fileList };
}

function analyzeFilesize(rootDir) {
  console.log('📊 Analyzing file sizes in multiverse-wiki...\n');
  console.log('='.repeat(80));
  
  const { totalSize, fileList } = getDirectorySize(rootDir);
  
  // Sort files by size (largest first)
  const sortedFiles = fileList.sort((a, b) => b.size - a.size);
  
  // Group by extension
  const byExtension = {};
  fileList.forEach(file => {
    const ext = file.ext;
    if (!byExtension[ext]) {
      byExtension[ext] = { count: 0, totalSize: 0, files: [] };
    }
    byExtension[ext].count++;
    byExtension[ext].totalSize += file.size;
    byExtension[ext].files.push(file);
  });
  
  // Group by directory
  const byDirectory = {};
  fileList.forEach(file => {
    const dir = path.dirname(file.path) || '.';
    if (!byDirectory[dir]) {
      byDirectory[dir] = { count: 0, totalSize: 0 };
    }
    byDirectory[dir].count++;
    byDirectory[dir].totalSize += file.size;
  });
  
  // Print summary
  console.log('\n📈 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total files: ${fileList.length.toLocaleString()}`);
  console.log(`Total size: ${formatBytes(totalSize)}`);
  console.log(`Average file size: ${formatBytes(totalSize / fileList.length)}`);
  
  // Print top 20 largest files
  console.log('\n🔝 TOP 20 LARGEST FILES');
  console.log('-'.repeat(80));
  sortedFiles.slice(0, 20).forEach((file, index) => {
    console.log(`${String(index + 1).padStart(2)}. ${file.path.padEnd(60)} ${formatBytes(file.size).padStart(10)}`);
  });
  
  // Print by extension
  console.log('\n📁 BY FILE EXTENSION');
  console.log('-'.repeat(80));
  const sortedExtensions = Object.entries(byExtension)
    .sort((a, b) => b[1].totalSize - a[1].totalSize);
  
  sortedExtensions.forEach(([ext, data]) => {
    const percentage = ((data.totalSize / totalSize) * 100).toFixed(2);
    console.log(`${ext.padEnd(15)} ${String(data.count).padStart(6)} files  ${formatBytes(data.totalSize).padStart(12)}  (${percentage}%)`);
  });
  
  // Print by directory (top 20)
  console.log('\n📂 TOP 20 LARGEST DIRECTORIES');
  console.log('-'.repeat(80));
  const sortedDirs = Object.entries(byDirectory)
    .sort((a, b) => b[1].totalSize - a[1].totalSize)
    .slice(0, 20);
  
  sortedDirs.forEach(([dir, data], index) => {
    const percentage = ((data.totalSize / totalSize) * 100).toFixed(2);
    console.log(`${String(index + 1).padStart(2)}. ${dir.padEnd(60)} ${formatBytes(data.totalSize).padStart(12)}  (${data.count} files, ${percentage}%)`);
  });
  
  // Detailed analysis for specific directories
  console.log('\n🔍 DETAILED DIRECTORY ANALYSIS');
  console.log('-'.repeat(80));
  
  const importantDirs = ['public/images', 'dist/images', 'data/extracted', 'src'];
  importantDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      const { totalSize: dirSize, fileList: dirFiles } = getDirectorySize(dirPath, []);
      const byExt = {};
      dirFiles.forEach(file => {
        const ext = file.ext;
        if (!byExt[ext]) {
          byExt[ext] = { count: 0, totalSize: 0 };
        }
        byExt[ext].count++;
        byExt[ext].totalSize += file.size;
      });
      
      console.log(`\n${dir}/`);
      console.log(`  Total: ${formatBytes(dirSize)} (${dirFiles.length} files)`);
      const sortedExt = Object.entries(byExt)
        .sort((a, b) => b[1].totalSize - a[1].totalSize)
        .slice(0, 5);
      sortedExt.forEach(([ext, data]) => {
        const pct = ((data.totalSize / dirSize) * 100).toFixed(1);
        console.log(`    ${ext.padEnd(15)} ${String(data.count).padStart(4)} files  ${formatBytes(data.totalSize).padStart(10)}  (${pct}%)`);
      });
    }
  });
  
  console.log('\n' + '='.repeat(80));
  
  // Save detailed report
  const reportPath = path.join(rootDir, 'FILESIZE_ANALYSIS.md');
  const report = generateMarkdownReport(totalSize, fileList, byExtension, byDirectory, sortedFiles);
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n✅ Detailed report saved to: ${path.relative(process.cwd(), reportPath)}`);
}

function generateMarkdownReport(totalSize, fileList, byExtension, byDirectory, sortedFiles) {
  let report = `# File Size Analysis Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total files:** ${fileList.length.toLocaleString()}\n`;
  report += `- **Total size:** ${formatBytes(totalSize)}\n`;
  report += `- **Average file size:** ${formatBytes(totalSize / fileList.length)}\n\n`;
  
  report += `## Top 50 Largest Files\n\n`;
  report += `| Rank | File | Size |\n`;
  report += `|------|------|------|\n`;
  sortedFiles.slice(0, 50).forEach((file, index) => {
    report += `| ${index + 1} | \`${file.path}\` | ${formatBytes(file.size)} |\n`;
  });
  
  report += `\n## By File Extension\n\n`;
  report += `| Extension | Count | Total Size | Percentage |\n`;
  report += `|-----------|-------|------------|------------|\n`;
  const sortedExtensions = Object.entries(byExtension)
    .sort((a, b) => b[1].totalSize - a[1].totalSize);
  sortedExtensions.forEach(([ext, data]) => {
    const percentage = ((data.totalSize / totalSize) * 100).toFixed(2);
    report += `| ${ext} | ${data.count} | ${formatBytes(data.totalSize)} | ${percentage}% |\n`;
  });
  
  report += `\n## By Directory\n\n`;
  report += `| Directory | Files | Total Size | Percentage |\n`;
  report += `|-----------|-------|------------|------------|\n`;
  const sortedDirs = Object.entries(byDirectory)
    .sort((a, b) => b[1].totalSize - a[1].totalSize);
  sortedDirs.forEach(([dir, data]) => {
    const percentage = ((data.totalSize / totalSize) * 100).toFixed(2);
    report += `| \`${dir}\` | ${data.count} | ${formatBytes(data.totalSize)} | ${percentage}% |\n`;
  });
  
  return report;
}

// Run analysis
const wikiRoot = path.join(__dirname, '../..');
analyzeFilesize(wikiRoot);

