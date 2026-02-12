/**
 * Template Extraction Script
 *
 * Extracts templates from defaultTemplates.ts to individual JSON files
 */

const fs = require('fs');
const path = require('path');

// Read the defaultTemplates.ts file
const templateFile = fs.readFileSync(
  path.join(__dirname, 'frontend/src/services/templates/defaultTemplates.ts'),
  'utf-8'
);

// Extract the createJinjaTemplate function
const createJinjaTemplateMatch = templateFile.match(
  /function createJinjaTemplate\([\s\S]*?\n\}\)/
);

if (!createJinjaTemplateMatch) {
  console.error('Could not find createJinjaTemplate function');
  process.exit(1);
}

// Extract all template calls
const templateCallRegex = /createJinjaTemplate\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*`([\s\S]*?)`\s*,\s*(\[[\s\S]*?\])\s*,\s*(\{[\s\S]*?\})\s*,\s*(\[[\s\S]*?\])\s*\)/g;

const templates = [];
let match;

while ((match = templateCallRegex.exec(templateFile)) !== null) {
  const [
    fullMatch,
    id,
    name,
    description,
    category,
    jinjaTemplate,
    variablesStr,
    defaultValuesStr,
    tagsStr
  ] = match;

  try {
    // Parse the variables array
    const variables = eval(variablesStr);

    // Parse the default values object
    const defaultValues = eval(defaultValuesStr);

    // Parse the tags array
    const tags = eval(tagsStr);

    templates.push({
      id,
      name,
      description,
      category,
      template: {
        name,
        description,
        data: {
          label: defaultValues.label || name
        },
        jinjaTemplate,
        variables,
        defaultValues,
        style: {},
        isPublic: true,
        tags
      }
    });
  } catch (error) {
    console.error(`Error parsing template ${id}:`, error.message);
  }
}

// Also extract the custom HTML template (which doesn't use createJinjaTemplate)
const customTemplateMatch = templateFile.match(
  /id: 'template-custom-html'[\s\S]*?\}\s*,\s*\[[\s\S]*?\]\s*\)\s*\]/
);

if (customTemplateMatch) {
  try {
    // This is more complex, we'll handle it manually
    console.log('Found custom HTML template');
  } catch (error) {
    console.error('Error parsing custom template:', error.message);
  }
}

console.log(`Found ${templates.length} templates`);

// Write templates to JSON files
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

templates.forEach(template => {
  if (categories[template.category]) {
    categories[template.category].push(template);
  }
});

// Create directory structure
const baseDir = path.join(__dirname, 'frontend/src/services/templates/built-in');

Object.entries(categories).forEach(([category, categoryTemplates]) => {
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

console.log('Extraction complete!');
