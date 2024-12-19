// scripts/prepare-docs.js
const fs = require("fs");
const path = require("path");

function scanDirectory(dir) {
  const groups = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      !["assets", ".nojekyll", "CNAME"].includes(entry.name)
    ) {
      const pages = [];
      const subDir = path.join(dir, entry.name);
      const subEntries = fs.readdirSync(subDir, { withFileTypes: true });

      for (const subEntry of subEntries) {
        if (subEntry.name.endsWith(".html") || subEntry.name.endsWith(".md")) {
          const baseName = subEntry.name
            .replace(".html", "")
            .replace(".md", "");
          pages.push(`api/${entry.name}/${baseName}`);
        }
      }

      if (pages.length > 0) {
        groups[entry.name] = pages;
      }
    }
  }

  return groups;
}

function processFile(sourcePath, targetPath) {
  let content = fs.readFileSync(sourcePath, "utf8");

  // Remove .html extensions from links
  content = content.replace(/\.html/g, "");
  content = content.replace(/\.md/g, "");

  // Create title from filename
  const filename = path.basename(sourcePath, path.extname(sourcePath));
  const title = filename.replace(/([A-Z])/g, " $1").trim();

  const frontmatter = `---
title: "${title}"
description: "Documentation for ${title}"
---

`;

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, frontmatter + content);
}

function processDocs(sourceDir) {
  // First, create the api directory if it doesn't exist
  if (!fs.existsSync("api")) {
    fs.mkdirSync("api", { recursive: true });
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      if (!["assets", ".nojekyll", "CNAME"].includes(entry.name)) {
        // Create corresponding directory in api/
        const targetDir = path.join("api", entry.name);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const subEntries = fs.readdirSync(sourcePath, { withFileTypes: true });
        for (const subEntry of subEntries) {
          if (
            subEntry.name.endsWith(".html") ||
            subEntry.name.endsWith(".md")
          ) {
            const sourceFilePath = path.join(sourcePath, subEntry.name);
            const targetFilePath = path.join(
              "api",
              entry.name,
              subEntry.name.replace(".html", ".mdx").replace(".md", ".mdx")
            );
            processFile(sourceFilePath, targetFilePath);
          }
        }
      }
    } else if (entry.name === "modules.html" || entry.name === "index.html") {
      // Handle root level files
      const targetFilePath = path.join(
        "api",
        entry.name.replace(".html", ".mdx").replace(".md", ".mdx")
      );
      processFile(sourcePath, targetFilePath);
    }
  }
}

// Generate mint.json configuration
function generateMintConfig() {
  const groups = scanDirectory("./docs");

  // Prepare navigation structure
  const navigation = [
    {
      group: "Getting Started",
      pages: ["introduction", "quickstart"],
    },
  ];

  // Add each documentation group to navigation
  for (const [groupName, pages] of Object.entries(groups)) {
    navigation.push({
      group: groupName.charAt(0).toUpperCase() + groupName.slice(1),
      pages: pages,
    });
  }

  // Add modules at the end if it exists
  if (fs.existsSync(path.join("api", "modules.mdx"))) {
    navigation.push({
      group: "API Reference",
      pages: ["api/modules"],
    });
  }

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
    navigation,
  };

  fs.writeFileSync("mint.json", JSON.stringify(config, null, 2));
}

// Main execution
console.log("Processing documentation...");
processDocs("./docs");

console.log("Generating Mintlify configuration...");
generateMintConfig();

console.log("Documentation processing complete!");
