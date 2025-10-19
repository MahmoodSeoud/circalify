# Circalify

A simple, dependency-free JavaScript library for creating beautiful circular timeline visualizations.

Perfect for annual planning, project timelines, and cyclical data. Built with pure JavaScript and SVG.

## Installation

```bash
npm install circalify
```

## Quick Start

### Option 1: Using a Bundler (Webpack, Vite, Parcel, etc.)

```javascript
import CircularTimeline from 'circalify';

const timeline = new CircularTimeline('#timeline', {
    startYear: 2025,
    startMonth: 0, // January
    numberOfMonths: 12,
    rings: [
        {
            type: 'calendar',
            calendarType: 'month-names',
            color: '#f0f0f0',
            height: 18
        },
        {
            type: 'data',
            name: 'Events',
            color: '#4ECDC4',
            unit: 'day',
            height: 20
        }
    ]
});

// Add your events
timeline.setData([
    {
        label: 'Project Launch',
        startDate: '2025-03-15',
        endDate: '2025-03-15',
        color: '#FF6B6B'
    },
    {
        label: 'Development Sprint',
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        color: '#4ECDC4'
    }
], 'Events');
```

### Option 2: Directly in HTML (via CDN)

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        #timeline { width: 100%; height: 600px; }
    </style>
</head>
<body>
    <div id="timeline"></div>

    <script type="module">
        import CircularTimeline from 'https://unpkg.com/circalify/src/index.js';

        const timeline = new CircularTimeline('#timeline', {
            startYear: 2025,
            startMonth: 0,
            numberOfMonths: 12,
            rings: [
                { type: 'calendar', calendarType: 'month-names', color: '#f0f0f0', height: 18 },
                { type: 'data', name: 'Events', color: '#4ECDC4', unit: 'day', height: 20 }
            ]
        });

        timeline.setData([
            { label: 'Project Launch', startDate: '2025-03-15', endDate: '2025-03-15' }
        ], 'Events');
    </script>
</body>
</html>
```

## Configuration

### General Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startYear` | number | required | Year to visualize |
| `startMonth` | number | `0` | Starting month (0-11, where 0 = January) |
| `numberOfMonths` | number | `12` | Number of months to display |
| `sameRingHeight` | boolean | `false` | Whether all rings should have equal height |
| `backgroundColor` | string | `'#ffffff'` | Background color of the visualization |
| `interactive` | boolean | `true` | Enable hover and click interactions |

### Ring Types

**Calendar Ring** - Displays time divisions (months, weeks, days, quarters)

```javascript
{
  type: 'calendar',
  calendarType: 'month-names' | 'weeks' | 'days' | 'quarters',
  active: true,
  color: '#f0f0f0',
  height: 18,
  fontSize: 11,
  fontColor: '#333'
}
```

**Header Ring** - Provides labels and categorical divisions

```javascript
{
  type: 'header',
  headerText: 'Quarter Goals',
  active: true,
  cells: 4,
  color: '#ffffff',
  height: 12,
  fontSize: 9,
  fontColor: '#666'
}
```

**Data Ring** - Shows events positioned by their dates

```javascript
{
  type: 'data',
  name: 'Events',
  active: true,
  color: '#4ECDC4',
  unit: 'day' | 'week' | 'month' | 'quarter',
  height: 20,
  fontSize: 10,
  fontColor: '#fff'
}
```

### Event Data Format

Events must include date information:

```javascript
{
  label: 'Event Name',
  startDate: 'YYYY-MM-DD',  // ISO date string
  endDate: 'YYYY-MM-DD',    // ISO date string
  color: '#FF6B6B',         // Optional: override ring color
  description: 'Details'    // Optional: shown in detail panel
}
```

## Examples

**Just double-click `examples/demo.html`** - it loads from CDN and runs immediately! No server needed.

## API

### Constructor

```javascript
new CircularTimeline(container, config, callbacks)
```

- `container`: CSS selector string or DOM element
- `config`: Configuration object (see Configuration section)
- `callbacks`: Optional object with `onSegmentClick`, `onSegmentHover`, `onSegmentLeave`

### Methods

**`setData(events, ringName)`**

Add or update events for a specific data ring.

```javascript
timeline.setData(eventsArray, 'Events');
```

**`getRings()`**

Get all rings in the visualization.

```javascript
const rings = timeline.getRings();
```

**`destroy()`**

Clean up and remove the visualization.

```javascript
timeline.destroy();
```

## About Circular Timelines

Circular timeline visualizations follow standard data visualization principles for representing cyclical data. This library provides developers with a flexible tool to create these visualizations with full control over styling and configuration.

The circular format is particularly effective for:
- Annual planning and calendar views
- Project timelines that repeat yearly
- Cyclical business processes
- Seasonal data visualization
- Multi-layer temporal comparisons

## Browser Support

Works in all modern browsers that support ES6 modules and SVG. No build step required for development.

## License

This software is available under two licenses:

1. AGPL v3.0 for non-commercial use (free)
2. Commercial License for commercial use (contact for pricing)

See LICENSE file for details.

## Contributing

Issues and pull requests welcome! Visit the [GitHub repository](https://github.com/MahmoodSeoud/circalify) to contribute.
