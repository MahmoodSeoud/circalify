# Circalify - Circular Annual Wheel Visualization

A zero-dependency JavaScript library for creating beautiful circular annual calendar visualizations, inspired by PlanDisc.

## Features

### PlanDisc-Style Interface
- **Header Bar** with calendar/planning toggle buttons
- **Date Range Display** with navigation controls
- **Year Display** showing the current year range (e.g., "Jan 2025 - Dec 2025")

### Visual Elements
- **Multiple Concentric Rings** for organizing different categories of events
- **365 Day Segments** - one for each day of the year
- **Week Numbers** displayed around the outer edge (52 weeks)
- **Month Labels** positioned around the perimeter
- **Curved Text Labels** that follow the arc of each event segment
- **Current Date Timeline** - animated line showing today's date
- **Color-Coded Events** with customizable colors per event

### Interactive Features
- **Hover Effects** - segments highlight on mouseover with center info display
- **Click Events** - open detailed panel with event information
- **Zoom Controls** - +/- buttons for zooming in and out
- **Responsive Design** - adapts to container size
- **Smooth Animations** - CSS-based transitions and fade-ins

### Advanced Capabilities
- **Curved Text Rendering** - labels follow the arc of segments
- **Adaptive Font Sizing** - automatically adjusts text size based on segment width
- **Day-Based Positioning** - precise placement based on day of year (1-365)
- **Ring-Based Organization** - events organized into Outer, Middle, and Inner rings
- **Shadow Effects** - subtle shadows for depth
- **Detail Panel** - slide-in panel with comprehensive event information

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Annual Wheel</title>
</head>
<body>
    <div id="container" style="width: 100vw; height: 100vh;"></div>

    <script src="circalify-enhanced.js"></script>
    <script>
        const data = [
            {
                label: 'Q1 Planning',
                startDate: '2025-01-06',
                endDate: '2025-01-12',
                ring: 'Outer',
                color: '#5090d3',
                description: 'First quarter planning session'
            },
            // ... more events
        ];

        const circalify = new Circalify(
            document.getElementById('container'),
            data,
            {
                rings: ['Outer', 'Middle', 'Inner'],
                showWeekNumbers: true,
                showTimeline: true,
                enableZoom: true
            }
        );
    </script>
</body>
</html>
```

## Demo

Open `demo-plandisc.html` in your browser to see a fully-featured example with sample data.

## Configuration Options

### Ring Configuration
- `rings` - Array of ring names (default: `['Outer', 'Middle', 'Inner']`)
- `ringThickness` - Thickness of each ring in pixels (default: `60`)
- `ringGap` - Gap between rings in pixels (default: `2`)

### Size Configuration
- `innerRadius` - Inner radius of the wheel (default: `70`)
- `outerRadius` - Outer radius of the wheel (default: `320`)
- `viewBoxPadding` - Padding around the SVG (default: `50`)

### Colors
- `colors` - Array of colors for rings (default: `['#b8e6e6', '#ffd4d4', '#d4e8e0', '#f0dcd4']`)
- `backgroundColor` - Background color (default: `'#f5f7fa'`)
- `centerColor` - Center circle color (default: `'#ffffff'`)

### Labels
- `showMonthLabels` - Show month names (default: `true`)
- `showWeekNumbers` - Show week numbers (default: `true`)
- `monthLabels` - Custom month labels array
- `useCurvedText` - Use curved text for segment labels (default: `true`)

### Interactive Features
- `interactive` - Enable interactivity (default: `true`)
- `showTooltips` - Show tooltips on hover (default: `true`)
- `showTimeline` - Show current date indicator (default: `true`)
- `enableZoom` - Enable zoom controls (default: `true`)
- `enableDetailPanel` - Enable detail panel (default: `true`)

### Callbacks
- `onSegmentClick` - Called when a segment is clicked
- `onSegmentHover` - Called when hovering over a segment
- `onZoom` - Called when zoom level changes

## Event Data Format

Each event object should have:

```javascript
{
    label: 'Event Name',           // Required: Display name
    startDate: '2025-01-15',      // Required: Start date (YYYY-MM-DD)
    endDate: '2025-01-20',        // Optional: End date (defaults to startDate)
    ring: 'Outer',                // Required: Which ring to display in
    color: '#5090d3',             // Optional: Custom color
    description: 'Details...',    // Optional: Additional info
    id: 'unique-id'               // Optional: Unique identifier
}
```

## Comparison with Original PlanDisc

This implementation matches the PlanDisc design with:

✅ Header with toggle buttons and date navigation
✅ Multiple concentric rings for organization
✅ Week numbers around the outer edge
✅ Curved text labels on segments
✅ Color-coded events and activities
✅ Interactive hover and click behavior
✅ Center display showing event details
✅ Zoom controls for better viewing
✅ Responsive SVG-based rendering

## Browser Support

Works in all modern browsers that support:
- SVG 1.1
- ES6 JavaScript
- CSS3 animations

## License

MIT

## Credits

Inspired by the PlanDisc annual planning visualization.
