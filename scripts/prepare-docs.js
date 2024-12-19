// scripts/prepare-docs.js
const fs = require('fs');
const path = require('path');

function processMarkdownFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add frontmatter
  const filename = path.basename(filePath, '.md');
  let title = filename.charAt(0).toUpperCase() + filename.slice(1);
  
  // Clean up the title
  title = title.replace(/([A-Z])/g, ' $1').trim(); // Add spaces before capital letters
  
  const frontmatter = `---
title: ${title}
description: API documentation for ${title}
---

`;

  // Improve code block formatting
  content = content.replace(/```(typescript|javascript)/g, '```ts');
  
  // Ensure proper spacing around code blocks
  content = content.replace(/```(\w+)\n/g, '```$1\n\n');
  content = content.replace(/\n```\n/g, '\n\n```\n\n');
  
  // Improve method signature formatting
  content = content.replace(
    /(### \w+)\n\n(.*?)\(\)/g,
    '$1\n\n```ts\n$2()\n```'
  );

  // Add proper spacing around headings
  content = content.replace(/\n(#{1,6} .*)\n/g, '\n\n$1\n\n');

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