# Circalify

A flexible, zero-dependency JavaScript library for creating interactive circular annual wheel visualizations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6-yellow.svg)
![Dependencies](https://img.shields.io/badge/dependencies-none-green.svg)

## Features

- 🎯 **Zero Dependencies** - Pure JavaScript, no frameworks required
- 🎨 **Highly Customizable** - Colors, sizes, rings, and labels
- 📱 **Responsive** - Scales perfectly to container size
- 🔍 **Interactive Zoom** - Show 12, 6, 3, or 1 month views
- 💫 **Smooth Animations** - Hover effects and transitions
- 🎪 **Event Management** - Smart collision detection for overlapping events
- 📊 **Multiple Rings** - Organize events by category/priority
- 📅 **Timeline Indicator** - Shows current date position
- 🔧 **Clean API** - Simple methods for initialization, updates, and destruction

## Installation

### Direct Download
Download `circalify.js` and include it in your HTML:

```html
<script src="circalify.js"></script>
```

### NPM (coming soon)
```bash
npm install circalify
```

### CDN (coming soon)
```html
<script src="https://unpkg.com/circalify/circalify.min.js"></script>
```

## Quick Start

```javascript
// Create a container element
const container = document.getElementById('wheel-container');

// Define your data
const data = [
  {
    date: '2024-01-15',      // ISO date string or Date object
    label: 'Project Start',   // Event name
    ring: 'Planning',         // Which ring to place it on
    color: '#3498db'          // Optional custom color
  },
  {
    date: new Date(2024, 2, 20),
    label: 'Design Review',
    ring: 'Design',
    description: 'Review with stakeholders'  // Optional description
  }
];

// Define options
const options = {
  rings: ['Planning', 'Design', 'Development'],  // Ring labels
  innerRadius: 100,                              // Inner circle radius
  outerRadius: 400,                              // Outer circle radius
  colors: ['#e74c3c', '#3498db', '#2ecc71'],    // Ring colors
  enableZoom: true,                              // Enable zoom controls
  showTimeline: true                             // Show current date indicator
};

// Initialize Circalify
const wheel = new Circalify(container, data, options);
```

## API Reference

### Constructor

```javascript
new Circalify(container, data, options)
```

**Parameters:**
- `container` (HTMLElement, required) - The DOM element to render the wheel in
- `data` (Array) - Array of event objects
- `options` (Object) - Configuration options

### Data Format

Each event in the data array should have:

```javascript
{
  date: '2024-01-15',        // Required: ISO date string or Date object
  label: 'Event Name',       // Required: Event title
  ring: 'Category',          // Required: Which ring (must match rings in options)
  color: '#FF5733',          // Optional: Override ring color for this event
  description: 'Details...'  // Optional: Tooltip description
}
```

### Options

```javascript
{
  // Ring Configuration
  rings: ['Outer', 'Middle', 'Inner'],     // Ring labels
  ringThickness: 30,                       // Thickness of each ring in pixels
  ringGap: 5,                               // Gap between rings in pixels

  // Size Configuration
  innerRadius: 70,                          // Center circle radius
  outerRadius: 280,                         // Outermost ring radius

  // Visual Configuration
  colors: ['#color1', '#color2', ...],     // Colors for each ring
  backgroundColor: '#e5f5fc',               // Center circle color
  strokeColor: 'white',                     // Ring border color
  strokeWidth: 2,                           // Ring border width

  // Labels
  showLabels: true,                         // Show ring labels
  showMonthLabels: true,                    // Show month labels
  monthLabels: ['Jan', 'Feb', ...],        // Custom month labels
  startMonth: 0,                            // 0=January, 11=December

  // Interaction
  interactive: true,                        // Enable interactions
  showTooltips: true,                       // Show tooltips on hover
  showTimeline: true,                       // Show current date line

  // Zoom
  enableZoom: false,                        // Enable zoom controls
  zoomLevels: [12, 6, 3, 1],              // Available zoom levels (months)

  // Events
  eventRadius: 15,                          // Event bubble radius

  // Callbacks
  onEventClick: (event, e) => {},          // Click handler
  onEventHover: (event, e) => {},          // Hover handler
  onZoom: (zoomLevel) => {}                // Zoom change handler
}
```

### Methods

#### `update(data)`
Update the wheel with new data:

```javascript
wheel.update([
  { date: '2024-06-15', label: 'New Event', ring: 'Planning' }
]);
```

#### `destroy()`
Clean up and remove the wheel:

```javascript
wheel.destroy();
```

#### `getZoomLevel()`
Get the current zoom level (months shown):

```javascript
const months = wheel.getZoomLevel(); // Returns: 12, 6, 3, or 1
```

#### `setZoomLevel(months)`
Set the zoom level programmatically:

```javascript
wheel.setZoomLevel(6); // Show 6 months
```

#### `exportSVG()`
Export the wheel as an SVG string:

```javascript
const svgString = wheel.exportSVG();
```

## Examples

### Basic Company Calendar

```javascript
const wheel = new Circalify(container, [
  { date: '2024-01-15', label: 'Q1 Planning', ring: 'Operations' },
  { date: '2024-04-01', label: 'Q2 Review', ring: 'Operations' },
  { date: '2024-03-31', label: 'Q1 Close', ring: 'Finance' },
  { date: '2024-06-30', label: 'Q2 Close', ring: 'Finance' },
  { date: '2024-02-14', label: 'Team Event', ring: 'HR' },
  { date: '2024-07-15', label: 'Summer Picnic', ring: 'HR' }
], {
  rings: ['Operations', 'Finance', 'HR'],
  colors: ['#3498db', '#9b59b6', '#e74c3c']
});
```

### Project Timeline

```javascript
const projectWheel = new Circalify(container, projectEvents, {
  rings: ['Research', 'Design', 'Development', 'Testing', 'Deployment'],
  colors: ['#1abc9c', '#3498db', '#9b59b6', '#e74c3c', '#f39c12'],
  enableZoom: true,
  onEventClick: (event) => {
    showProjectDetails(event);
  }
});
```

### Personal Calendar

```javascript
const personalWheel = new Circalify(container, personalEvents, {
  rings: ['Work', 'Health', 'Family', 'Hobbies'],
  innerRadius: 80,
  outerRadius: 300,
  showTimeline: true,
  colors: ['#34495e', '#e74c3c', '#f39c12', '#2ecc71']
});
```

## Advanced Usage

### Custom Event Rendering

```javascript
const wheel = new Circalify(container, data, {
  onEventClick: (event, mouseEvent) => {
    // Custom modal or action
    openCustomModal({
      title: event.label,
      date: event.date,
      description: event.description
    });
  },
  onEventHover: (event, mouseEvent) => {
    // Custom tooltip
    showCustomTooltip(event, mouseEvent);
  }
});
```

### Dynamic Updates

```javascript
// Add events dynamically
function addEvent(eventData) {
  const currentData = [...existingData, eventData];
  wheel.update(currentData);
}

// Filter events
function filterByRing(ring) {
  const filtered = allData.filter(e => e.ring === ring);
  wheel.update(filtered);
}

// Update colors dynamically
function updateTheme(isDark) {
  wheel.destroy();
  wheel = new Circalify(container, data, {
    ...options,
    colors: isDark ? darkColors : lightColors
  });
}
```

### Export and Save

```javascript
function downloadWheel() {
  const svg = wheel.exportSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'annual-wheel.svg';
  link.click();

  URL.revokeObjectURL(url);
}
```

## Mathematical Notes

The library uses polar coordinates to position events:

```javascript
// Calculate event position
const angleStep = (2 * Math.PI) / monthsShown;
const monthAngle = angleStep * monthIndex - Math.PI / 2;
const dayProgress = dayOfMonth / daysInMonth;
const angle = monthAngle + angleStep * dayProgress;

const x = centerX + radius * Math.cos(angle);
const y = centerY + radius * Math.sin(angle);
```

Collision detection uses distance calculation between events:

```javascript
// Detect overlapping events
const distance = Math.sqrt(
  Math.pow(event1.x - event2.x, 2) +
  Math.pow(event1.y - event2.y, 2)
);

if (distance < threshold) {
  // Apply radial offset to separate events
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

The library uses modern JavaScript features (ES6+) and SVG, which are supported in all modern browsers.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by circular calendar visualizations
- Mathematical calculations adapted from polar coordinate systems
- Event collision detection based on force-directed graph algorithms

## Roadmap

- [ ] NPM package publication
- [ ] TypeScript definitions
- [ ] Animation transitions
- [ ] Drag-and-drop event management
- [ ] Export to PNG/PDF
- [ ] Theme presets
- [ ] Accessibility improvements (ARIA labels)
- [ ] Touch gesture support
- [ ] Multi-year support
- [ ] Recurring events

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/yourusername/circalify/issues) on GitHub.