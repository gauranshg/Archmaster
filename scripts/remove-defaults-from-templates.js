/**
 * Remove defaultValue from variables and defaultValues from template JSONs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, '../frontend/src/services/templates/built-in');

function processTemplateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    let modified = false;

    // Handle nested "template" object structure
    const target = data.template || data;

    // Remove defaultValue from each variable
    if (target.variables && Array.isArray(target.variables)) {
      target.variables.forEach(variable => {
        if (variable.defaultValue !== undefined) {
          delete variable.defaultValue;
          modified = true;
        }
      });
    }

    // Remove defaultValues object entirely
    if (target.defaultValues !== undefined) {
      delete target.defaultValues;
      modified = true;
    }

    if (modified) {
      // Write back with proper formatting
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`✓ Updated: ${path.relative(templatesDir, filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += walkDirectory(filePath);
    } else if (file.endsWith('.json')) {
      if (processTemplateFile(filePath)) {
        count++;
      }
    }
  }

  return count;
}

console.log('Removing defaultValue and defaultValues from template JSONs...\n');
const count = walkDirectory(templatesDir);
console.log(`\nDone! Updated ${count} file(s).`);
