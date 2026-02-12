# Template System Quick Start Guide

## Overview

The Template System lets you create reusable node templates and quickly add them to your diagrams. Perfect for maintaining consistent architecture diagrams across projects.

## Accessing the Template Library

Navigate to `/templates` in your browser or click "Templates" in the navigation bar.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Navigation Bar]                                           │
├──────────┬──────────────────────────────┬──────────────────┤
│          │                              │                  │
│ Template │      Diagram Canvas          │   Properties     │
│ Library  │                              │   Panel          │
│          │                              │                  │
│ [Search] │                              │                  │
│          │                              │                  │
│ [Filter] │     [Drag templates here]    │                  │
│          │                              │                  │
│ Template │                              │                  │
│ Template │                              │                  │
│ Template │                              │                  │
│          │                              │                  │
└──────────┴──────────────────────────────┴──────────────────┘
```

## Basic Usage

### 1. Browse Templates

Templates are organized by category:
- **🗄️ Database**: PostgreSQL, MongoDB, etc.
- **⚙️ Service**: REST API, Microservices
- **🏗️ Infrastructure**: Queues, Cache, Storage
- **🔗 External**: External systems, APIs
- **🧩 Component**: UI components, libraries
- **📦 Container**: Web apps, mobile apps
- **✨ Custom**: Your custom templates

### 2. Search Templates

Use the search box to find templates by:
- Template name (e.g., "PostgreSQL")
- Description (e.g., "database")
- Tags (e.g., "sql", "api")

### 3. Filter by Category

Click category buttons to show only templates in that category:
- Click "All" to show all templates
- Click specific category to filter
- Button turns blue when active

### 4. Add Template to Canvas

**Method 1: Drag and Drop**
1. Click and hold on a template card
2. Drag it over the canvas
3. Release at desired position
4. Node appears at drop location

**Method 2: Click to Add**
1. Click on a template card (coming soon)
2. Move mouse to canvas
3. Click to place node

### 5. View Templates

Toggle between views:
- **Grid view** (default): Shows template thumbnails
- **List view**: Compact list with names and icons

Toggle using the buttons in the library header.

## Creating Custom Templates

### Step 1: Create/Select Nodes

1. Add nodes to your canvas (using NodeToolbar or templates)
2. Customize the node (edit label, add description, change styling)
3. Select one or more nodes

### Step 2: Open Save Dialog

Click "Save as Template" button (appears when nodes are selected)

### Step 3: Fill Template Details

**Template Name** (required)
- Enter a descriptive name
- Example: "User Service Database"

**Description** (optional)
- Add a brief description
- Example: "Primary database for user microservice"

**Category** (required)
- Choose the best fitting category
- Helps organize templates

**Tags** (optional)
- Add search-friendly tags
- Examples: "production", "critical", "aws", "postgres"

### Step 4: Save

Click "Save Template" button. Template will appear in library.

## Template Features

### Visual Preview
- Thumbnail shows what the template looks like
- Generated automatically from the node

### Metadata
- **Name**: Template identifier
- **Description**: What the template represents
- **Category**: Organizational group
- **Tags**: Search keywords
- **Author**: Who created it
- **Created/Updated**: Timestamps

### Delete Templates
- Hover over template card
- Click trash icon (appears on hover)
- Confirm deletion
- Note: Built-in templates cannot be deleted

## Tips and Tricks

### Consistent Naming
Use consistent naming conventions:
- "Production Database"
- "Staging Database"
- "Development Database"

### Meaningful Tags
Add useful tags:
- Environment: "production", "staging", "dev"
- Technology: "postgres", "redis", "aws"
- Purpose: "cache", "storage", "queue"

### Template Composition
Create templates for common patterns:
- "Three-tier architecture" (web + api + database)
- "Microservice with cache" (service + redis + db)
- "External integration" (api + queue + cache)

### Customization
After adding a template to canvas:
- Edit the label
- Change colors
- Add descriptions
- Adjust size

## Built-in Templates Reference

### Database Templates

**PostgreSQL Database**
- Icon: 🗄️
- Color: Blue
- Use: Relational databases

**MongoDB Database**
- Icon: 🍃
- Color: Green
- Use: NoSQL document databases

### Service Templates

**REST API**
- Icon: 🔌
- Color: Green
- Use: RESTful services

**Microservice**
- Icon: ⚙️
- Color: Purple
- Use: Business services

### Infrastructure Templates

**Message Queue**
- Icon: 📬
- Color: Orange
- Use: Async messaging (RabbitMQ, Kafka)

**Cache**
- Icon: ⚡
- Color: Yellow
- Use: In-memory cache (Redis, Memcached)

**Object Storage**
- Icon: 📦
- Color: Cyan
- Use: S3, Blob storage

### External Templates

**External API**
- Icon: 🌐
- Color: Gray (dashed border)
- Use: Third-party APIs

**External System**
- Icon: 🔗
- Color: Gray (dashed border)
- Use: Third-party systems

**User**
- Icon: 👤
- Color: White/Gray
- Use: Human users (C4 model)

**Administrator**
- Icon: 👨‍💼
- Color: White/Gray
- Use: System admins (C4 model)

### Component Templates

**UI Component**
- Icon: 🎨
- Color: Pink
- Use: Frontend components

**Component Library**
- Icon: 📚
- Color: Pink
- Use: Reusable libraries

### Container Templates

**Web Application**
- Icon: 🌍
- Color: Blue
- Use: Web apps (SPA/MPA)

**Mobile App**
- Icon: 📱
- Color: Blue
- Use: iOS/Android apps

## Troubleshooting

### Template not appearing
- Check IndexedDB is enabled in browser
- Refresh the page
- Check browser console for errors

### Drag and drop not working
- Ensure you're dragging from template library
- Drop onto the white canvas area
- Check browser console for errors

### Can't delete template
- Built-in templates cannot be deleted
- Only custom templates show delete button
- Custom templates are those you created

### Thumbnail missing
- Thumbnail generation may have failed
- Template will show colored placeholder instead
- Functionality not affected

## Keyboard Shortcuts (Coming Soon)

- `Ctrl/Cmd + T` - Focus template search
- `Ctrl/Cmd + S` - Save selected as template
- `Delete` - Delete selected template (when focused)

## Video Tutorials (Coming Soon)

1. Getting Started with Templates (5 min)
2. Creating Custom Templates (8 min)
3. Advanced Template Techniques (12 min)
4. Building Template Libraries (15 min)

## Need Help?

- Check the full documentation: `services/templates/README.md`
- View demo: `/templates` route
- Report issues: GitHub issues
- Request features: GitHub discussions

---

**Happy Diagramming! 🎨**
