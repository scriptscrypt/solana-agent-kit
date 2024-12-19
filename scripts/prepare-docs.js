// scripts/prepare-docs.js
const fs = require("fs");
const path = require("path");

function processFile(sourcePath, targetPath) {
  console.log(`Processing file: ${sourcePath} -> ${targetPath}`);

  let content = fs.readFileSync(sourcePath, "utf8");
  console.log(`Read content from ${sourcePath}`);

  const filename = path.basename(sourcePath, path.extname(sourcePath));

  const frontmatter = `---
title: "${filename}"
description: "Documentation for ${filename}"
---

`;

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, frontmatter + content);
  console.log(`Wrote content to ${targetPath}`);
}

function processDirectory(sourceDir, targetBaseDir = "api", navPath = "") {
  console.log(`Processing directory: ${sourceDir}`);

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  const navigationItems = [];

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      if (!["assets", ".nojekyll", "CNAME"].includes(entry.name)) {
        console.log(`Found directory: ${entry.name}`);
        const targetDir = path.join(targetBaseDir, entry.name);
        const newNavPath = navPath ? `${navPath}/${entry.name}` : entry.name;
        const subItems = processDirectory(sourcePath, targetDir, newNavPath);
        if (subItems.length > 0) {
          navigationItems.push({
            group: entry.name,
            pages: subItems,
          });
        }
      }
    } else if (entry.name.endsWith(".html")) {
      console.log(`Found HTML file: ${entry.name}`);
      const targetPath = path.join(
        targetBaseDir,
        entry.name.replace(".html", ".mdx")
      );
      processFile(sourcePath, targetPath);
      // Create navigation path without 'api/' prefix
      const navItem = navPath
        ? `${navPath}/${entry.name.replace(".html", "")}`
        : entry.name.replace(".html", "");
      navigationItems.push(navItem);
    }
  }

  return navigationItems;
}

// Main execution
console.log("Starting documentation processing...");

try {
  // Create api directory if it doesn't exist
  if (!fs.existsSync("api")) {
    console.log("Creating api directory");
    fs.mkdirSync("api", { recursive: true });
  }

  // Process all documentation
  const navigation = [
    {
      group: "Getting Started",
      pages: ["introduction", "quickstart"],
    },
  ];

  const apiNavigation = processDirectory("./docs");
  if (apiNavigation.length > 0) {
    navigation.push({
      group: "API Reference",
      pages: apiNavigation.map((item) => {
        // Remove 'api/' from the beginning of paths
        return item.startsWith("api/") ? item.substring(4) : item;
      }),
    });
  }

  // Generate mint.json
  const mintConfig = {
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

  console.log(
    "Writing mint.json with configuration:",
    JSON.stringify(mintConfig, null, 2)
  );
  fs.writeFileSync("mint.json", JSON.stringify(mintConfig, null, 2));

  console.log("Documentation processing complete!");
} catch (error) {
  console.error("Error processing documentation:", error);
  process.exit(1);
}
