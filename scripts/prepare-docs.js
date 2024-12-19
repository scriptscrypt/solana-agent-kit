// // scripts/prepare-docs.js
// const fs = require('fs');
// const path = require('path');

// function processFile(sourcePath, targetPath) {
//   let content = fs.readFileSync(sourcePath, 'utf8');
  
//   const filename = path.basename(sourcePath, path.extname(sourcePath));
  
//   const frontmatter = `---
// title: "${filename}"
// description: "Documentation for ${filename}"
// ---

// `;

//   // Ensure target directory exists
//   const targetDir = path.dirname(targetPath);
//   if (!fs.existsSync(targetDir)) {
//     fs.mkdirSync(targetDir, { recursive: true });
//   }

//   fs.writeFileSync(targetPath, frontmatter + content);
// }

// // Create the base mint.json structure
// const baseConfig = {
//   "$schema": "https://mintlify.com/schema.json",
//   "name": "Solana Agent Kit",
//   "logo": {
//     "light": "/logo/light.svg",
//     "dark": "/logo/dark.svg"
//   },
//   "layout": "sidenav",
//   "favicon": "/favicon.svg",
//   "sidebar": {
//     "items": "border"
//   },
//   "colors": {
//     "primary": "#9945FF",
//     "light": "#14F195",
//     "dark": "#9945FF"
//   },
//   "api": {
//     "auth": {
//       "method": "bearer"
//     }
//   },
//   "background": {
//     "style": "windows"
//   },
//   "topbarLinks": [
//     {
//       "name": "GitHub",
//       "url": "https://github.com/scriptscrypt/solana-agent-kit"
//     }
//   ],
//   "topbarCtaButton": {
//     "name": "Get Started",
//     "url": "/quickstart"
//   },
//   "codeBlock": {
//     "mode": "auto"
//   },
//   "feedback": {
//     "thumbsRating": true,
//     "suggestEdit": true
//   }
// };

// try {
//   // Create api directory if it doesn't exist
//   if (!fs.existsSync('api')) {
//     fs.mkdirSync('api', { recursive: true });
//   }

//   // Process docs directory
//   const docsPath = './docs';
//   const entries = fs.readdirSync(docsPath, { withFileTypes: true });

//   // Initialize navigation
//   const navigation = [
//     {
//       group: "Getting Started",
//       pages: ["introduction", "quickstart"]
//     }
//   ];

//   // Process API Reference section
//   const apiSection = {
//     group: "API Reference",
//     pages: ["api/modules"]
//   };

//   // Process each category
//   const categories = {
//     'classes': { icon: 'cube' },
//     'functions': { icon: 'function' },
//     'interfaces': { icon: 'brackets-curly' }
//   };

//   Object.entries(categories).forEach(([category, config]) => {
//     const categoryDir = path.join(docsPath, category);
//     if (fs.existsSync(categoryDir)) {
//       const files = fs.readdirSync(categoryDir)
//         .filter(file => file.endsWith('.html'))
//         .map(file => file.replace('.html', ''));

//       if (files.length > 0) {
//         // Process each file
//         files.forEach(file => {
//           const sourcePath = path.join(categoryDir, `${file}.html`);
//           const targetPath = path.join('api', category, `${file}.mdx`);
//           processFile(sourcePath, targetPath);
//         });

//         // Add to navigation
//         apiSection.pages.push({
//           group: category.charAt(0).toUpperCase() + category.slice(1),
//           icon: config.icon,
//           pages: files.map(file => `api/${category}/${file}`)
//         });
//       }
//     }
//   });

//   navigation.push(apiSection);

//   // Create final config
//   const mintConfig = {
//     ...baseConfig,
//     navigation,
//     footer: {
//       socials: {
//         github: "https://github.com/scriptscrypt/solana-agent-kit"
//       }
//     }
//   };

//   fs.writeFileSync('mint.json', JSON.stringify(mintConfig, null, 2));
//   console.log('Documentation processing complete!');
// } catch (error) {
//   console.error('Error processing documentation:', error);
//   process.exit(1);
// }


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

  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, frontmatter + content);
}

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
  "background": {
    "style": "windows"
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
  const TARGET_DIR = 'v2-docs';
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const navigation = [];

  // Add Getting Started section
  navigation.push({
    group: "Getting Started",
    pages: ["introduction", "quickstart"]
  });

  // Add Classes section
  if (fs.existsSync('docs/classes')) {
    const classFiles = fs.readdirSync('docs/classes')
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));

    navigation.push({
      group: "Classes",
      icon: "cube",
      pages: classFiles.map(file => `v2-docs/classes/${file}`)
    });

    // Process class files
    classFiles.forEach(file => {
      const sourcePath = path.join('docs/classes', `${file}.md`);
      const targetPath = path.join(TARGET_DIR, 'classes', `${file}.mdx`);
      processFile(sourcePath, targetPath);
    });
  }

  // Add Functions section
  if (fs.existsSync('docs/functions')) {
    const functionFiles = fs.readdirSync('docs/functions')
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));

    navigation.push({
      group: "Functions",
      icon: "function",
      pages: functionFiles.map(file => `v2-docs/functions/${file}`)
    });

    // Process function files
    functionFiles.forEach(file => {
      const sourcePath = path.join('docs/functions', `${file}.md`);
      const targetPath = path.join(TARGET_DIR, 'functions', `${file}.mdx`);
      processFile(sourcePath, targetPath);
    });
  }

  // Add Interfaces section
  if (fs.existsSync('docs/interfaces')) {
    const interfaceFiles = fs.readdirSync('docs/interfaces')
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));

    navigation.push({
      group: "Interfaces",
      icon: "brackets-curly",
      pages: interfaceFiles.map(file => `v2-docs/interfaces/${file}`)
    });

    // Process interface files
    interfaceFiles.forEach(file => {
      const sourcePath = path.join('docs/interfaces', `${file}.md`);
      const targetPath = path.join(TARGET_DIR, 'interfaces', `${file}.mdx`);
      processFile(sourcePath, targetPath);
    });
  }

  // Add Guides section
  if (fs.existsSync('docs/guides')) {
    const guideFiles = fs.readdirSync('docs/guides')
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));

    navigation.push({
      group: "Guides",
      icon: "book-open",
      pages: guideFiles.map(file => `v2-docs/guides/${file}`)
    });

    // Process guide files
    guideFiles.forEach(file => {
      const sourcePath = path.join('docs/guides', `${file}.md`);
      const targetPath = path.join(TARGET_DIR, 'guides', `${file}.mdx`);
      processFile(sourcePath, targetPath);
    });
  }

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
  console.log('Navigation structure:', JSON.stringify(navigation, null, 2));

} catch (error) {
  console.error('Error processing documentation:', error);
  process.exit(1);
}