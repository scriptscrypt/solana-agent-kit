// scripts/prepare-docs.js
const fs = require('fs');
const path = require('path');

function processMarkdownFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add frontmatter
  const filename = path.basename(filePath, '.md');
  const title = filename.charAt(0).toUpperCase() + filename.slice(1);
  
  const frontmatter = `---
title: ${title}
description: API documentation for ${title}
---

`;

  return frontmatter + content;
}

function processDocsDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDocsDirectory(filePath);
    } else if (file.endsWith('.md')) {
      const processedContent = processMarkdownFile(filePath);
      fs.writeFileSync(filePath, processedContent);
    }
  });
}

// Process all markdown files in the docs directory
processDocsDirectory('./docs');