// scripts/prepare-docs.js
const fs = require('fs');
const path = require('path');

function processFile(sourcePath, targetPath) {
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  const filename = path.basename(sourcePath, path.extname(sourcePath));
  
  const frontmatter = `---
title: "${filename}"
description: "Documentation for ${filename}"
---

`;

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, frontmatter + content);
}

function getNavigationForDirectory(dir) {
  const pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      const baseName = entry.name.replace(/\.(md|mdx)$/, '');
      const relativePath = path.relative('api', dir);
      pages.push(relativePath ? `${relativePath}/${baseName}` : baseName);
    }
  });
  
  return pages;
}

// Main execution
console.log('Starting documentation processing...');

try {
  // Create api directory if it doesn't exist
  if (!fs.existsSync('api')) {
    fs.mkdirSync('api', { recursive: true });
  }

  // Process docs directory
  const docsPath = './docs';
  const entries = fs.readdirSync(docsPath, { withFileTypes: true });

  // Process each directory and file
  entries.forEach(entry => {
    const sourcePath = path.join(docsPath, entry.name);
    
    if (entry.isDirectory() && !['assets', '.nojekyll', 'CNAME'].includes(entry.name)) {
      // Process directory
      const targetDir = path.join('api', entry.name);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Process files in the directory
      const files = fs.readdirSync(sourcePath);
      files.forEach(file => {
        if (file.endsWith('.html')) {
          const sourceFile = path.join(sourcePath, file);
          const targetFile = path.join(targetDir, file.replace('.html', '.mdx'));
          processFile(sourceFile, targetFile);
        }
      });
    } else if (entry.name.endsWith('.html')) {
      // Process root level files
      const targetFile = path.join('api', entry.name.replace('.html', '.mdx'));
      processFile(sourcePath, targetFile);
    }
  });

  // Generate mint.json with navigation
  const navigation = [
    {
      group: "Getting Started",
      pages: ["introduction", "quickstart"]
    }
  ];

  // Add Classes section if it exists
  if (fs.existsSync('api/classes')) {
    const classesPages = getNavigationForDirectory('api/classes');
    if (classesPages.length > 0) {
      navigation.push({
        group: "Classes",
        pages: classesPages
      });
    }
  }

  // Add Functions section if it exists
  if (fs.existsSync('api/functions')) {
    const functionsPages = getNavigationForDirectory('api/functions');
    if (functionsPages.length > 0) {
      navigation.push({
        group: "Functions",
        pages: functionsPages
      });
    }
  }

  // Add Interfaces section if it exists
  if (fs.existsSync('api/interfaces')) {
    const interfacesPages = getNavigationForDirectory('api/interfaces');
    if (interfacesPages.length > 0) {
      navigation.push({
        group: "Interfaces",
        pages: interfacesPages
      });
    }
  }

  // Add root level API docs if they exist
  const rootApiPages = getNavigationForDirectory('api')
    .filter(page => !page.includes('/'));
  if (rootApiPages.length > 0) {
    navigation.push({
      group: "API Reference",
      pages: rootApiPages
    });
  }

  const mintConfig = {
    name: "Solana Agent Kit",
    logo: {
      light: "/logo/light.png",
      dark: "/logo/dark.png"
    },
    favicon: "/favicon.png",
    colors: {
      primary: "#0C8CE9"
    },
    navigation
  };

  fs.writeFileSync('mint.json', JSON.stringify(mintConfig, null, 2));
  console.log('Generated mint.json with navigation:', JSON.stringify(navigation, null, 2));

} catch (error) {
  console.error('Error processing documentation:', error);
  process.exit(1);
}