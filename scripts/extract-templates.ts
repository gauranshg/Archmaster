/**
 * Template Extraction Script (TypeScript)
 *
 * Run with: npx tsx scripts/extract-templates.ts
 *
 * Extracts all templates from defaultTemplates.ts to individual JSON files
 */

import fs from 'fs';
import path from 'path';

// The template file path
const templateFilePath = path.join(process.cwd(), 'frontend/src/services/templates/defaultTemplates.ts');

// Read and parse the template file
const content = fs.readFileSync(templateFilePath, 'utf-8');

// Import the DEFAULT_TEMPLATES array by executing the file
// We'll use a simpler approach: copy the file to a temp .js file, import it, then extract

const tempFile = path.join(process.cwd(), 'temp-templates.js');

// Convert TypeScript to JavaScript for execution
const jsContent = content
  .replace(/import type \{[^}]+\} from[^;]+;/g, '')
  .replace(/: string/g, '')
  .replace(/: TemplateCategory/g, '')
  .replace(/: BuiltInTemplate\[\]/g, '')
  .replace(/: TemplateVariable\[\]/g, '')
  .replace(/: Record<string, any>/g, '')
  .replace(/: string\[\]/g, '')
  .export const DEFAULT_TEMPLATES = 'module.exports.DEFAULT_TEMPLATES =';

fs.writeFileSync(tempFile, jsContent, 'utf-8');

// Import the templates
// eslint-disable-next-line @typescript-eslint/no-var-requires
const templatesModule = require(tempFile);
const templates = templatesModule.DEFAULT_TEMPLATES;

console.log(`Extracted ${templates.length} templates`);

// Clean up temp file
fs.unlinkSync(tempFile);

// Create directory structure
const baseDir = path.join(process.cwd(), 'frontend/src/services/templates/built-in');

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
templates.forEach((template: any) => {
  if (categories[template.category]) {
    categories[template.category].push(template);
  }
});

// Create JSON files
Object.entries(categories).forEach(([category, categoryTemplates]: [string, any[]]) => {
  if (!categoryTemplates.length) {
    console.log(`No templates for category: ${category}`);
    return;
  }

  const categoryDir = path.join(baseDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  categoryTemplates.forEach((template) => {
    const filename = `${template.id.replace('template-', '')}.json`;
    const filepath = path.join(categoryDir, filename);

    fs.writeFileSync(
      filepath,
      JSON.stringify(template, null, 2),
      'utf-8'
    );

    console.log(`✓ Created: ${filepath}`);
  });
});

console.log('\n✅ Extraction complete!');
