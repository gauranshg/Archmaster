"""
Template Extraction Script - Version 2

Extracts templates from defaultTemplates.ts to individual JSON files
Handles multi-line template strings properly
"""

import re
import json
import os
from pathlib import Path

# Read the defaultTemplates.ts file
template_file_path = Path(__file__).parent / 'frontend/src/services/templates/defaultTemplates.ts'

with open(template_file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Split by createJinjaTemplate calls
template_blocks = []
lines = content.split('\n')
current_template = []
in_template = False
template_depth = 0

for line in lines:
    if 'createJinjaTemplate(' in line:
        in_template = True
        template_depth = 1
        current_template = [line]
    elif in_template:
        current_template.append(line)
        # Count parentheses to find the end
        template_depth += line.count('(') - line.count(')')
        if template_depth == 0 and line.strip().endswith(')'):
            in_template = False
            template_blocks.append('\n'.join(current_template))
            current_template = []

print(f"Found {len(template_blocks)} template blocks")

# Parse each template block
templates = []

for i, block in enumerate(template_blocks):
    try:
        # Extract ID
        id_match = re.search(r"createJinjaTemplate\(\s*'([^']+)'", block)
        if not id_match:
            continue
        template_id = id_match.group(1)

        # Extract name
        name_match = re.search(r"createJinjaTemplate\(\s*'[^']+'\s*,\s*'([^']+)'", block)
        if not name_match:
            continue
        name = name_match.group(1)

        # Extract description
        desc_match = re.search(r"createJinjaTemplate\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'", block)
        if not desc_match:
            continue
        description = desc_match.group(1)

        # Extract category
        cat_match = re.search(r"createJinjaTemplate\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'", block)
        if not cat_match:
            continue
        category = cat_match.group(1)

        # Extract jinja template (between backticks)
        jinja_match = re.search(r'`([^`]+?)`', block, re.DOTALL)
        if not jinja_match:
            continue
        jinja_template = jinja_match.group(1).strip()

        # Extract variables array
        vars_match = re.search(r'\[\s*\{[^}]+\}[\s\S]*?\]', block)
        if not vars_match:
            continue
        variables_str = vars_match.group(0)

        # Extract default values object
        defaults_match = re.search(r'\{\s*label:[^}]+\}', block)
        if not defaults_match:
            continue
        default_values_str = defaults_match.group(0)

        # Extract tags array
        tags_match = re.search(r'\[\s*\'[^\']+\'[\s\S]*?\]\s*\)', block)
        if not tags_match:
            continue
        tags_str = tags_match.group(0).rstrip(')')

        # Parse JavaScript syntax to Python
        variables_str = variables_str.replace('true', 'True').replace('false', 'False').replace('null', 'None')
        default_values_str = default_values_str.replace('true', 'True').replace('false', 'False').replace('null', 'None')
        tags_str = tags_str.replace('true', 'True').replace('false', 'False').replace('null', 'None')

        variables = eval(variables_str)
        default_values = eval(default_values_str)
        tags = eval(tags_str)

        template = {
            "id": template_id,
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
        print(f"✓ Parsed: {template_id}")

    except Exception as e:
        print(f"✗ Error parsing template block {i}: {e}")
        # Print first few lines for debugging
        if len(block) > 0:
            print(f"  First 200 chars: {block[:200]}")

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
