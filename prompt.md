I have code that creates a circular annual wheel visualization using svg.js. 
It currently works but is tightly coupled to a specific use case.

I need you to refactor this into a flexible, reusable JavaScript library 
called "circalify" (or annual-wheel) that:

REQUIREMENTS:
1. Pure JavaScript (no framework dependencies, no React/Vue/etc)
2. Zero dependencies except for basic DOM manipulation
3. Works by passing a container element, data, and options
4. Should NOT use svg.js - use native SVG creation instead
5. Clean, simple API that's easy to use

API DESIGN:
```javascript
// Basic usage
const wheel = new Circalify(container, data, options);

// Update
wheel.update(newData);

// Destroy
wheel.destroy();
```

DATA FORMAT:
```javascript
const data = [
  {
    date: '2024-01-15',      // ISO date string
    label: 'Event Name',      // Event title
    ring: 'outer',            // Which ring: 'outer', 'middle', 'inner'
    color: '#FF5733'          // Optional color
  },
  // ... more events
];
```

OPTIONS:
```javascript
const options = {
  rings: ['Training', 'Operations', 'Planning'],  // Ring labels
  innerRadius: 100,          // Inner circle radius
  outerRadius: 400,          // Outer circle radius
  startMonth: 0,             // 0 = January
  colors: ['#color1', '#color2', '#color3'],  // Default colors per ring
  showLabels: true,          // Show month labels
  interactive: true          // Enable hover/click
};
```

ARCHITECTURE:
- Single class or factory function
- All SVG creation using document.createElementNS (no svg.js)
- Clean separation: data processing, layout calculation, rendering
- Should handle resize gracefully
- TypeScript-ready structure (even if written in JS)

WHAT TO PRESERVE FROM MY CODE:
- The math for circular positioning
- The multi-ring structure
- The visual style

WHAT TO IMPROVE:
- Make it generic and reusable
- Remove hardcoded values
- Clean API
- Better structure
- Add error handling
- Add basic validation
- Remove SharePoint specific stuff

OUTPUT:
1. Single JavaScript file with the library
2. Brief usage example
3. Comment the tricky math parts
