/**
 * Simplified Template Extraction Script
 *
 * Extracts templates by parsing the file text directly
 */

const fs = require('fs');
const path = require('path');

// Read the defaultTemplates.ts file
const templateFilePath = path.join(__dirname, 'frontend/src/services/templates/defaultTemplates.ts');
const content = fs.readFileSync(templateFilePath, 'utf-8');

// Find all template calls
const templates = [];
const callRegex = /createJinjaTemplate\(/g;
let match;
let callCount = 0;

while ((match = callRegex.exec(content)) !== null) {
  callCount++;
  const startIndex = match.index;

  // Find the end of this function call
  let depth = 1;
  let i = startIndex + 20;
  let inTemplateString = false;
  let inArray = false;
  let inObject = false;

  while (i < content.length && depth > 0) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';

    // Track template string (backticks)
    if (char === '`' && prevChar !== '\\') {
      inTemplateString = !inTemplateString;
    }

    // Track arrays
    if (!inTemplateString && char === '[' && prevChar !== '\\') {
      inArray = true;
    }
    if (!inTemplateString && char === ']' && prevChar !== '\\') {
      inArray = false;
    }

    // Track objects
    if (!inTemplateString && char === '{' && prevChar !== '\\') {
      inObject = true;
    }
    if (!inTemplateString && char === '}' && prevChar !== '\\') {
      inObject = false;
    }

    // Count parentheses
    if (!inTemplateString) {
      if (char === '(') depth++;
      if (char === ')') depth--;
    }

    i++;

    // Safety check
    if (i - startIndex > 10000) {
      console.log(`Skipping call at ${startIndex} (too long)`);
      depth = 0;
      break;
    }
  }

  if (depth === 0) {
    const templateCall = content.substring(startIndex, i);

    // Extract parameters manually
    const paramMatches = [
      // ID
      templateCall.match(/createJinjaTemplate\(\s*'([^']+)'/),
      // Name
      templateCall.match(/createJinjaTemplate\(\s*'[^']+'\s*,\s*'([^']+)'/),
      // Description
      templateCall.match(/createJinjaTemplate\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'/),
      // Category
      templateCall.match(/createJinjaTemplate\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'/),
    ];

    if (paramMatches[0] && paramMatches[1] && paramMatches[2] && paramMatches[3]) {
      const id = paramMatches[0][1];
      const name = paramMatches[1][1];
      const description = paramMatches[2][1];
      const category = paramMatches[3][1];

      // Skip duplicates
      if (templates.find(t => t.id === id)) continue;

      templates.push({
        id,
        name,
        description,
        category,
        fullCall: templateCall
      });

      console.log(`Found: ${id}`);
    }
  }
}

console.log(`\nFound ${templates.length} unique templates`);

// Now extract each template's details
const baseDir = path.join(__dirname, 'frontend/src/services/templates/built-in');

templates.forEach(templateInfo => {
  try {
    // Extract template string (between first set of backticks)
    const templateMatch = templateInfo.fullCall.match(/`([^`]+?)`/);
    if (!templateMatch) {
      console.log(`Skipping ${templateInfo.id}: no template string found`);
      return;
    }

    const jinjaTemplate = templateMatch[1].trim();

    // Extract variables array (after template string, before default values)
    const afterTemplate = templateInfo.fullCall.substring(templateMatch.index + templateMatch[0].length);

    // Find variables array
    const varsMatch = afterTemplate.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (!varsMatch) {
      console.log(`Skipping ${templateInfo.id}: no variables array found`);
      return;
    }

    // Convert JavaScript object to JSON
    let variablesStr = varsMatch[0];
    variablesStr = variablesStr.replace(/name:\s*'/g, '"name": "')
                                .replace(/',\s*label:/g, '", "label":')
                                .replace(/type:\s*'/g, '"type": "')
                                .replace(/',\s*description:/g, '", "description":')
                                .replace(/',\s*defaultValue:/g, '", "defaultValue":')
                                .replace(/',\s*required:/g, '", "required":')
                                .replace(/required:\s*true/g, 'required: true')
                                .replace(/required:\s*false/g, 'required: false')
                                .replace(/min:\s*/g, '"min": ')
                                .replace(/max:\s*/g, '"max": ')
                                .replace(/'/g, '"');

    const variables = JSON.parse(variablesStr);

    // Find default values object
    const defaultsMatch = afterTemplate.match(varsMatch.index + varsMatch[0].length, /\{\s*label:[\s\S]*?\n\s*\}/);
    if (!defaultsMatch) {
      console.log(`Skipping ${templateInfo.id}: no default values found`);
      return;
    }

    // Find tags array
    const tagsMatch = afterTemplate.match(/\[\s*['"][^'"]+['"][\s\S]*?\]\s*\)/);
    let tags = [];
    if (tagsMatch) {
      const tagsStr = tagsMatch[0].replace(/\)/g, '').replace(/'/g, '"');
      tags = JSON.parse(tagsStr);
    }

    // Build the template object
    const template = {
      id: templateInfo.id,
      name: templateInfo.name,
      category: templateInfo.category,
      template: {
        name: templateInfo.name,
        description: templateInfo.description,
        data: {
          label: templateInfo.name
        },
        jinjaTemplate,
        variables,
        defaultValues: {},
        style: {},
        isPublic: true,
        tags
      }
    };

    // Extract default values from variables
    variables.forEach(v => {
      if (v.defaultValue !== undefined) {
        template.template.defaultValues[v.name] = v.defaultValue;
      }
    });

    // Create category directory
    const categoryDir = path.join(baseDir, templateInfo.category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Write JSON file
    const filename = `${templateInfo.id.replace('template-', '')}.json`;
    const filepath = path.join(categoryDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(template, null, 2), 'utf-8');
    console.log(`Created: ${filepath}`);

  } catch (error) {
    console.error(`Error processing ${templateInfo.id}:`, error.message);
  }
});

console.log('\nExtraction complete!');
