// scripts/prepare-docs.js
const fs = require("fs");
const path = require("path");

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function scanDirectory(dir) {
  const pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["assets", ".nojekyll", "CNAME"].includes(entry.name)) {
        const subPages = scanDirectory(fullPath);
        if (subPages.length > 0) {
          pages.push({
            group: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
            pages: subPages,
          });
        }
      }
    } else if (entry.name.endsWith(".html")) {
      pages.push(fullPath.replace(".html", "").replace("docs/", ""));
    } else if (entry.name.endsWith(".md")) {
      pages.push(fullPath.replace(".md", "").replace("docs/", ""));
    }
  }

  return pages;
}

function generateMintConfig() {
  const pages = scanDirectory("./docs");

  const config = {
    name: "Solana Agent Kit",
    logo: {
      light: "/logo/light.png",
      dark: "/logo/dark.png",
    },
    favicon: "/favicon.png",
    colors: {
      primary: "#0C8CE9",
    },
    navigation: pages,
  };

  fs.writeFileSync("mint.json", JSON.stringify(config, null, 2));
}

function processFile(sourcePath, targetPath) {
  const content = fs.readFileSync(sourcePath, "utf8");
  const filename = path.basename(sourcePath, path.extname(sourcePath));

  // Add frontmatter
  const frontmatter = `---
title: '${filename}'
description: 'Documentation for ${filename}'
---

`;

  const processedContent = content
    .replace(/\.html/g, "") // Remove .html extensions from links
    .replace(/\.md/g, ""); // Remove .md extensions from links

  ensureDirectoryExistence(targetPath);
  fs.writeFileSync(targetPath, frontmatter + processedContent);
}

function processDocs(sourceDir, targetDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(
      targetDir,
      entry.name.replace(".html", ".mdx").replace(".md", ".mdx")
    );

    if (entry.isDirectory()) {
      if (!["assets", ".nojekyll", "CNAME"].includes(entry.name)) {
        processDocs(sourcePath, targetPath);
      }
    } else if (entry.name.endsWith(".html") || entry.name.endsWith(".md")) {
      processFile(sourcePath, targetPath);
    }
  }
}

// Generate Mintlify config based on docs structure
console.log("Generating Mintlify configuration...");
generateMintConfig();

// Process documentation files
console.log("Processing documentation files...");
processDocs("./docs", "./");

console.log("Documentation processing complete!");
