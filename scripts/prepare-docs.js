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

// Create the base mint.json structure
const baseConfig = {
  "$schema": "https://mintlify.com/schema.json",
  "name": "Solana Agent Kit",
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "layout": "sidenav",
  "favicon": "/favicon.svg",
  "sidebar": {
    "items": "border"
  },
  "colors": {
    "primary": "#9945FF",
    "light": "#14F195",
    "dark": "#9945FF"
  },
  "api": {
    "auth": {
      "method": "bearer"
    }
  },
  "background": {
    "style": "windows"
  },
  "topbarLinks": [
    {
      "name": "GitHub",
      "url": "https://github.com/scriptscrypt/solana-agent-kit"
    }
  ],
  "topbarCtaButton": {
    "name": "Get Started",
    "url": "/quickstart"
  },
  "codeBlock": {
    "mode": "auto"
  },
  "feedback": {
    "thumbsRating": true,
    "suggestEdit": true
  }
};

try {
  // Create api directory if it doesn't exist
  if (!fs.existsSync('api')) {
    fs.mkdirSync('api', { recursive: true });
  }

  // Process docs directory
  const docsPath = './docs';
  const entries = fs.readdirSync(docsPath, { withFileTypes: true });

  // Initialize navigation
  const navigation = [
    {
      group: "Getting Started",
      pages: ["introduction", "quickstart"]
    }
  ];

  // Process API Reference section
  const apiSection = {
    group: "API Reference",
    pages: ["api/modules"]
  };

  // Process each category
  const categories = {
    'classes': { icon: 'cube' },
    'functions': { icon: 'function' },
    'interfaces': { icon: 'brackets-curly' }
  };

  Object.entries(categories).forEach(([category, config]) => {
    const categoryDir = path.join(docsPath, category);
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir)
        .filter(file => file.endsWith('.html'))
        .map(file => file.replace('.html', ''));

      if (files.length > 0) {
        // Process each file
        files.forEach(file => {
          const sourcePath = path.join(categoryDir, `${file}.html`);
          const targetPath = path.join('api', category, `${file}.mdx`);
          processFile(sourcePath, targetPath);
        });

        // Add to navigation
        apiSection.pages.push({
          group: category.charAt(0).toUpperCase() + category.slice(1),
          icon: config.icon,
          pages: files.map(file => `api/${category}/${file}`)
        });
      }
    }
  });

  navigation.push(apiSection);

  // Create final config
  const mintConfig = {
    ...baseConfig,
    navigation,
    footer: {
      socials: {
        github: "https://github.com/scriptscrypt/solana-agent-kit"
      }
    }
  };

  fs.writeFileSync('mint.json', JSON.stringify(mintConfig, null, 2));
  console.log('Documentation processing complete!');
} catch (error) {
  console.error('Error processing documentation:', error);
  process.exit(1);
}