/**
 * Template Extraction Script
 *
 * Extracts all templates from defaultTemplates.ts to individual JSON files
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../frontend/src/services/templates/defaultTemplates.ts');
const outputDir = path.join(__dirname, '../frontend/src/services/templates/built-in');

// Read the file
const content = fs.readFileSync(inputFile, 'utf8');

// Find all createJinjaTemplate calls and extract them
const templateRegex = /createJinjaTemplate\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*`([^`]+)`\.trim\(\),\s*(\[[\s\S]*?\}\s*\]),\s*(\{[\s\S]*?\}\s*,)\s*(\[[\s\S]*?\])\s*\),?/g;

let match;
const templates = [];

// Find all templates using createJinjaTemplate
while ((match = templateRegex.exec(content)) !== null) {
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

  console.log(`Found: ${name} (${id})`);

  templates.push({
    id,
    name,
    description,
    category,
    jinjaTemplate: jinjaTemplate.trim(),
    variables: variablesStr.trim(),
    defaultValues: defaultValuesStr.trim(),
    tags: tagsStr.trim(),
    type: 'jinja'
  });
}

// Also find template-custom-html (different format)
const customHtmlRegex = /id:\s*['\"]template-custom-html['\"][\s\S]*?jinjaTemplate:\s*`([^`]+)`[\s\S]*?variables:\s*(\[[\s\S]*?\}\s*\]),[\s\S]*?defaultValues:\s*(\{[\s\S]*?\}),[\s\S]*?\}\s*,\s*\[[\s\S]*?\]\s*\)/;
const customHtmlMatch = content.match(customHtmlRegex);

if (customHtmlMatch) {
  console.log('Found: Custom HTML');
  templates.push({
    id: 'template-custom-html',
    name: 'Custom HTML',
    description: 'Full HTML control with dark styling',
    category: 'custom',
    jinjaTemplate: customHtmlMatch[1].trim(),
    variables: customHtmlMatch[2].trim(),
    defaultValues: customHtmlMatch[3].trim(),
    tags: "['custom', 'html', 'advanced']",
    type: 'custom'
  });
}

// Find template-red-glow-db (sample template)
const sampleRegex = /id:\s*['\"]sample-template-red-glow-db['\"][\s\S]*?jinjaTemplate:\s*`([^`]+)`[\s\S]*?variables:\s*(\[[\s\S]*?\}\s*\]),[\s\S]*?defaultValues:\s*(\{[\s\S]*?\}),[\s\S]*?\}\s*,\s*\[[\s\S]*?\]\s*\)/;
const sampleMatch = content.match(sampleRegex);

if (sampleMatch) {
  console.log('Found: Red Glow DB (Sample)');
  templates.push({
    id: 'sample-template-red-glow-db',
    name: 'Red Glow Database',
    description: 'Sample database with red glow effect',
    category: 'sample',
    jinjaTemplate: sampleMatch[1].trim(),
    variables: sampleMatch[2].trim(),
    defaultValues: sampleMatch[3].trim(),
    tags: "['sample', 'database', 'styled']",
    type: 'sample'
  });
}

console.log(`\nTotal templates found: ${templates.length}`);

// Create category directories
const categories = ['database', 'service', 'infrastructure', 'external', 'component', 'container', 'custom', 'sample'];
categories.forEach(cat => {
  const catDir = path.join(outputDir, cat);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }
});

// Write each template to a JSON file
templates.forEach(template => {
  const filename = template.id.replace('template-', '').replace('sample-', '') + '.json';
  const catDir = path.join(outputDir, template.category);
  const filepath = path.join(catDir, filename);

  // Convert to proper JSON
  // Parse the JavaScript-style variables and defaultValues
  let variables, defaultValues, tags;

  try {
    // Replace JavaScript syntax with JSON-compatible syntax
    const cleanVars = template.variables
      .replace(/name:/g, '"name":')
      .replace(/label:/g, '"label":')
      .replace(/type:/g, '"type":')
      .replace(/description:/g, '"description":')
      .replace(/defaultValue:/g, '"defaultValue":')
      .replace(/required:/g, '"required":')
      .replace(/min:/g, '"min":')
      .replace(/max:/g, '"max":')
      .replace(/true/g, 'true')
      .replace(/false/g, 'false')
      .replace(/'/g, '"');

    variables = JSON.parse(cleanVars);
  } catch (e) {
    console.error(`Error parsing variables for ${template.name}: ${e.message}`);
    variables = [];
  }

  try {
    const cleanDefaults = template.defaultValues
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"');

    defaultValues = JSON.parse(cleanDefaults);
  } catch (e) {
    console.error(`Error parsing defaultValues for ${template.name}: ${e.message}`);
    defaultValues = {};
  }

  try {
    tags = JSON.parse(template.tags.replace(/'/g, '"'));
  } catch (e) {
    console.error(`Error parsing tags for ${template.name}: ${e.message}`);
    tags = [];
  }

  // Create the final template object
  const finalTemplate = {
    id: template.id,
    name: template.name,
    category: template.category,
    template: {
      name: template.name,
      description: template.description,
      data: {
        label: defaultValues.label || template.name
      },
      jinjaTemplate: template.jinjaTemplate,
      variables: variables,
      defaultValues: defaultValues,
      style: {},
      isPublic: true,
      tags: tags
    }
  };

  // Write to file
  fs.writeFileSync(filepath, JSON.stringify(finalTemplate, null, 2), 'utf8');
  console.log(`Wrote: ${filepath}`);
});

console.log('\nExtraction complete!');
