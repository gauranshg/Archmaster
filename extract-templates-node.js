/**
 * Template Extraction Script (Node.js)
 *
 * Extracts templates from defaultTemplates.ts to individual JSON files
 * Uses JavaScript evaluation for reliable parsing
 */

const fs = require('fs');
const path = require('path');

// Read the defaultTemplates.ts file
const templateFilePath = path.join(__dirname, 'frontend/src/services/templates/defaultTemplates.ts');
const content = fs.readFileSync(templateFilePath, 'utf-8');

// Extract the createJinjaTemplate function
const funcMatch = content.match(/function createJinjaTemplate\([\s\S]*?\n\}/);
if (!funcMatch) {
  console.error('Could not find createJinjaTemplate function');
  process.exit(1);
}

// Create a safe evaluation context
const createJinjaTemplate = eval(
  `(${funcMatch[0].replace('function createJinjaTemplate', 'function').replace(/const DEFAULT_TEMPLATES[\s\S]*$/, '')})`
);

// Extract all template calls by finding complete function calls
const templates = [];
let lastIndex = 0;
const templateRegex = /createJinjaTemplate\(/g;
let match;

while ((match = templateRegex.exec(content)) !== null) {
  const startIndex = match.index;
  let depth = 1;
  let endIndex = startIndex + 20; // Skip past "createJinjaTemplate("
  let inString = false;
  let stringChar = '';
  let i = endIndex;

  // Find matching closing parenthesis
  while (i < content.length && depth > 0) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';

    // Handle string literals
    if ((char === '"' || char === '`' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (stringChar === char) {
        inString = false;
        stringChar = '';
      }
    }

    // Count parentheses outside strings
    if (!inString) {
      if (char === '(') depth++;
      if (char === ')') depth--;
    }

    i++;
  }

  if (depth === 0) {
    const templateCall = content.substring(startIndex, i);

    try {
      // Extract the template ID
      const idMatch = templateCall.match(/createJinjaTemplate\(\s*'([^']+)'/);
      if (!idMatch) continue;
      const id = idMatch[1];

      // Skip if we already processed this one
      if (templates.find(t => t.id === id)) continue;

      // Evaluate the template call to get the template object
      const templateObj = eval(templateCall);

      templates.push(templateObj);
      console.log(`✓ Extracted: ${id}`);
    } catch (error) {
      console.error(`✗ Error parsing template at index ${startIndex}:`, error.message);
    }

    lastIndex = i;
  }
}

// Handle the custom HTML template (doesn't use createJinjaTemplate)
const customMatch = content.match(/id:\s*['"]template-custom-html['"][\s\S]*?\}\s*,\s*\[[\s\S]*?\]\s*\)\s*\]/);
if (customMatch) {
  console.log('Found custom HTML template (will need manual handling)');
}

console.log(`\nTotal templates extracted: ${templates.length}`);

// Create directory structure
const baseDir = path.join(__dirname, 'frontend/src/services/templates/built-in');
const categories = {
  database: [],
  service: [],
  infrastructure: [],
  external: [],
  component: [],
  container: [],
  custom: [],
  sample: []
};

// Categorize templates
templates.forEach(template => {
  if (categories[template.category]) {
    categories[template.category].push(template);
  }
});

// Create files
Object.entries(categories).forEach(([category, categoryTemplates]) => {
  if (!categoryTemplates.length) return;

  const categoryDir = path.join(baseDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  categoryTemplates.forEach(template => {
    const filename = `${template.id.replace('template-', '')}.json`;
    const filepath = path.join(categoryDir, filename);

    fs.writeFileSync(
      filepath,
      JSON.stringify(template, null, 2),
      'utf-8'
    );

    console.log(`Created: ${filepath}`);
  });
});

console.log('\nExtraction complete!');
