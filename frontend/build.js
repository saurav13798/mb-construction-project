const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

function rimraf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('Cleaning dist/');
rimraf(distDir);
console.log('Running minifier...');
execSync('node minify.js', { cwd: __dirname, stdio: 'inherit' });
console.log('Copying public/ -> dist/');
copyRecursive(publicDir, distDir);

// Remove unminified JS/CSS from dist (keep minified versions)
const walk = (dir) => {
  for (const file of fs.readdirSync(dir)) {
    const fp = path.join(dir, file);
    const st = fs.statSync(fp);
    if (st.isDirectory()) walk(fp);
    else {
      if (/\.(js|css)$/.test(fp) && !/\.min\.(js|css)$/.test(fp)) {
        // Delete the unminified asset
        fs.unlinkSync(fp);
      }
    }
  }
};
walk(distDir);

console.log('Build complete. Dist folder is ready.');
