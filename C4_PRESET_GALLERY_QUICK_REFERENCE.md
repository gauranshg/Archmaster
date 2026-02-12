# C4 Preset Gallery - Quick Reference Guide

## Accessing the C4 Preset Gallery

1. Open any diagram in the Editor
2. Look at the left sidebar "Editor Tools"
3. Click the **"C4 Elements"** tab (between Templates and Navigation)

## Adding C4 Elements to Your Diagram

### Method 1: Click to Add
1. Browse the C4 Elements gallery
2. Click on any element card (e.g., "Web Application")
3. The element is automatically added to the canvas at a random position
4. Drag the element to your desired location

### Method 2: Drag and Drop
1. Click and hold on any element card
2. Drag it over to the canvas
3. Release at the desired position
4. The element is placed exactly where you dropped it

## Filtering C4 Elements

### By Category
Click the category buttons at the top:
- **All** (18 elements) - Show all C4 elements
- **People** (3 elements) - User, Administrator, External User
- **Systems** (3 elements) - Web App, API Gateway, Legacy System
- **Containers** (4 elements) - SPA, Mobile App, API, Worker
- **Components** (4 elements) - Controller, Service, Repository, Auth
- **Infrastructure** (4 elements) - Database, Cache, Queue, Storage

### By Diagram Type
The gallery automatically filters based on your diagram type:
- **System Context**: Shows Person + System elements
- **Container**: Shows Person + System + Container + Infrastructure
- **Component**: Shows all 18 elements

### By Search
Use the search bar to find elements by:
- Element name (e.g., "database", "API")
- Description (e.g., "messaging", "cache")
- Element type (e.g., "person", "container")

## View Modes

### Grid View (Default)
- Large cards with icons
- Shows full element details
- Best for browsing and discovery

### List View
- Compact horizontal cards
- Shows essential info only
- Best for scanning many elements quickly

Toggle between views using the buttons in the top-right.

## Available C4 Elements

### People
| Element | Icon | Description |
|---------|------|-------------|
| User | 👤 | Primary user of the system |
| Administrator | 👨‍💼 | Manages system configuration and maintenance |
| External User | 👥 | User from external organization |

### Software Systems
| Element | Icon | Description |
|---------|------|-------------|
| Web Application | 🌐 | Web-based application system |
| API Gateway | 🔌 | RESTful API gateway |
| Legacy System | 🏛️ | External legacy system integration |

### Containers
| Element | Icon | Description | Technology |
|---------|------|-------------|------------|
| Web App | ⚛️ | Single Page Application | React / Vue / Angular |
| Mobile App | 📱 | Native mobile application | iOS / Android |
| API Service | ⚙️ | RESTful API backend | Node.js / Python / Java |
| Worker | 🔄 | Background job processor | Celery / Bull / Sidekiq |

### Components
| Element | Icon | Description |
|---------|------|-------------|
| Controller | 🎮 | Request handler |
| Service | 📦 | Business logic layer |
| Repository | 🗄️ | Data access layer |
| Auth Module | 🔐 | Authentication service |

### Infrastructure
| Element | Icon | Description | Technology |
|---------|------|-------------|------------|
| Database | 🗄️ | Primary data store | PostgreSQL / MongoDB |
| Cache | ⚡ | In-memory cache | Redis / Memcached |
| Message Queue | 📨 | Async messaging | RabbitMQ / Kafka / SQS |
| Object Storage | 📦 | Blob storage service | S3 / Azure Blob |

## Styling

All C4 elements use consistent, professional styling:
- **Color-coded borders** by element type
- **Modern rounded corners** (8px border-radius)
- **Clean typography** with Inter font
- **Hover effects** for better interactivity
- **Proper spacing** and alignment

## Tips & Best Practices

1. **Start with System Context**: Begin with Person and System elements
2. **Drill Down**: Create child diagrams for Containers and Components
3. **Use Search**: Quickly find elements by typing keywords
4. **Leverage Categories**: Filter by category to reduce clutter
5. **Mix with Templates**: Combine C4 presets with custom templates
6. **Add Descriptions**: Click elements and add descriptions in Properties panel
7. **Consistent Naming**: Use clear, descriptive names for your elements

## Keyboard Shortcuts (Coming Soon)

Future versions will include keyboard shortcuts for quick element addition:
- `P` - Add Person
- `S` - Add Software System
- `C` - Add Container
- `D` - Add Database
- `Q` - Add Queue

## Customization

### Element Properties
After adding an element, you can customize:
- **Label**: Change the display name
- **Description**: Add detailed description
- **Styling**: Adjust colors, borders, sizes
- **Technology**: Specify technology stack
- **Icons**: Change the icon/emoji

### Custom Presets
Create your own presets:
1. Design a node with your desired styling
2. Save it as a template
3. Access from Templates tab

## Example: Building a 3-Tier Architecture

1. **System Context Diagram**:
   - Add 👤 User
   - Add 🌐 Web Application
   - Connect User → Web Application

2. **Container Diagram** (drill down from Web App):
   - Add ⚛️ Web App (frontend)
   - Add ⚙️ API Service (backend)
   - Add 🗄️ Database (data store)
   - Add ⚡ Cache (optional)
   - Connect: Web App → API Service → Database
   - Connect: API Service → Cache

3. **Component Diagram** (drill down from API Service):
   - Add 🎮 Controllers (multiple)
   - Add 📦 Services (multiple)
   - Add 🗄️ Repository (data access)
   - Add 🔐 Auth Module (security)
   - Connect based on your architecture

## Troubleshooting

**Q: Element not appearing when I click it?**
A: Check that you're not in read-only mode. Ensure the canvas has space.

**Q: Can't find specific element?**
A: Try the search bar or check if you're filtering by category. Reset filters by clicking "All".

**Q: Wrong elements shown for my diagram type?**
A: The gallery filters based on diagram type. Switch to "Component" diagram type to see all elements.

**Q: How do I delete an element?**
A: Select the element on canvas and press Delete key, or use the delete button in Properties panel.

## Feedback

Have suggestions for new C4 presets or improvements? Please provide feedback through the project's issue tracker.
