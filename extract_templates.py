"""
Template Extraction Script

Extracts templates from defaultTemplates.ts to individual JSON files
"""

import re
import json
import os
from pathlib import Path

# Read the defaultTemplates.ts file
template_file_path = Path(__file__).parent / 'frontend/src/services/templates/defaultTemplates.ts'

with open(template_file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all createJinjaTemplate calls
pattern = r"createJinjaTemplate\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+?)'\s*,\s*'([^']+)'\s*,\s*`([^`]+?)`\s*,\s*(\[[^\]]+?\])\s*,\s*(\{[^}]+?\})\s*,\s*(\[[^\]]+?\])\s*\)"

matches = re.finditer(pattern, content, re.DOTALL)

templates = []

for match in matches:
    id = match.group(1)
    name = match.group(2)
    description = match.group(3)
    category = match.group(4)
    jinja_template = match.group(5).strip()
    variables_str = match.group(6)
    default_values_str = match.group(7)
    tags_str = match.group(8)

    try:
        # Parse variables (convert JavaScript to Python)
        variables_json = variables_str.replace('true', 'True').replace('false', 'False').replace('null', 'None')
        variables = eval(variables_json)

        # Parse default values
        defaults_json = default_values_str.replace('true', 'True').replace('false', 'False').replace('null', 'None')
        default_values = eval(defaults_json)

        # Parse tags
        tags_json = tags_str.replace('true', 'True').replace('false', 'False').replace('null', 'None')
        tags = eval(tags_json)

        template = {
            "id": id,
            "name": name,
            "category": category,
            "template": {
                "name": name,
                "description": description,
                "data": {
                    "label": default_values.get("label", name)
                },
                "jinjaTemplate": jinja_template,
                "variables": variables,
                "defaultValues": default_values,
                "style": {},
                "isPublic": True,
                "tags": tags
            }
        }

        templates.append(template)
        print(f"Parsed template: {id}")

    except Exception as e:
        print(f"Error parsing template {id}: {e}")

# Also try to find the custom HTML template
custom_pattern = r"id:\s*['\"]template-custom-html['\"]"

custom_match = re.search(custom_pattern, content)

if custom_match:
    print("Found custom HTML template (will be handled manually)")

print(f"\nTotal templates extracted: {len(templates)}")

# Create directory structure and save templates
base_dir = Path(__file__).parent / 'frontend/src/services/templates/built-in'

categories = {
    'database': [],
    'service': [],
    'infrastructure': [],
    'external': [],
    'component': [],
    'container': [],
    'custom': [],
    'sample': []
}

# Categorize templates
for template in templates:
    category = template['category']
    if category in categories:
        categories[category].append(template)

# Create files
for category, category_templates in categories.items():
    if not category_templates:
        continue

    category_dir = base_dir / category
    category_dir.mkdir(parents=True, exist_ok=True)

    for template in category_templates:
        # Generate filename from template ID
        filename = template['id'].replace('template-', '') + '.json'
        filepath = category_dir / filename

        # Write JSON file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(template, f, indent=2, ensure_ascii=False)

        print(f"Created: {filepath}")

print("\nExtraction complete!")
