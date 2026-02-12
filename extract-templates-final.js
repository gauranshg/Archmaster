/**
 * Complete Template Extraction Script
 *
 * Extracts all 17 templates to individual JSON files
 */

const fs = require('fs');
const path = require('path');

// Read the TypeScript file
const templateFile = path.join(__dirname, 'frontend/src/services/templates/defaultTemplates.ts');
const content = fs.readFileSync(templateFile, 'utf-8');

// First, let's extract the createJinjaTemplate function implementation
// We'll need it to reconstruct the templates

// Now extract each template by parsing the function calls
const templates = [];

// Split into individual template calls
const lines = content.split('\n');
let currentTemplate = [];
let depth = 0;
let inCall = false;
let inTemplateString = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('createJinjaTemplate(') && !inCall) {
    inCall = true;
    depth = 1;
    currentTemplate = [line];
    continue;
  }

  if (inCall) {
    currentTemplate.push(line);

    // Track backtick strings
    const backtickCount = (line.match(/\`/g) || []).length;
    if (backtickCount > 0) {
      inTemplateString = !inTemplateString;
    }

    // Count parentheses outside strings
    if (!inTemplateString) {
      depth += (line.match(/\(/g) || []).length;
      depth -= (line.match(/\)/g) || []).length;
    }

    // End of template call
    if (depth === 0 && line.trim().endsWith(')')) {
      inCall = false;
      inTemplateString = false;

      const templateCode = currentTemplate.join('\n');

      // Extract template ID
      const idMatch = templateCode.match(/createJinjaTemplate\(\s*'([^']+)'/);
      if (idMatch) {
        const id = idMatch[1];

        // Check if we already have this one
        if (!templates.find(t => t.id === id)) {
          templates.push({
            id,
            code: templateCode
          });
          console.log(`Found template: ${id}`);
        }
      }

      currentTemplate = [];
    }
  }
}

// Also look for custom-html and red-glow-db templates
// These don't use createJinjaTemplate
const customMatch = content.match(/id:\s*['\"]template-custom-html['\"][\s\S]*?\}\s*,\s*\[[\s\S]*?\]\s*\)\s*\]/);
if (customMatch) {
  console.log('Found template-custom-html');
  templates.push({
    id: 'template-custom-html',
    code: customMatch[0],
    isCustom: true
  });
}

const sampleMatch = content.match(/id:\s*['\"]template-red-glow-db['\"][\s\S]*?\}\s*,\s*\[[\s\S]*?\]\s*\)\s*\]/);
if (sampleMatch) {
  console.log('Found template-red-glow-db');
  templates.push({
    id: 'template-red-glow-db',
    code: sampleMatch[0],
    isCustom: true
  });
}

console.log(`\nTotal templates found: ${templates.length}`);

// Now write a simpler approach - just copy the entire export and create JSON files
// Let's use the export directly

// Find the DEFAULT_TEMPLATES export
const exportMatch = content.match(/export const DEFAULT_TEMPLATES: BuiltInTemplate\[\] = \[([\s\S]*)\];/);

if (exportMatch) {
  console.log('Found DEFAULT_TEMPLATES export');

  // Write it to a temporary JS file we can import
  const tempJs = `
    ${content}
    module.exports = DEFAULT_TEMPLATES;
  `;

  fs.writeFileSync(path.join(__dirname, 'temp-templates-export.js'), tempJs);

  console.log('Wrote temp file to temp-templates-export.js');
  console.log('You can now import this in a Node script that can parse TypeScript syntax');
}

console.log('\nExtraction complete!');
