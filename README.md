# Circalify 2.0 - Flexible Ring-Based Annual Wheel

A completely refactored, modular circular annual calendar visualization library with flexible ring configuration.

## 🎯 Features

- **Flexible Ring System**: Add any number of rings in any order
- **Three Ring Types**: Calendar, Header, and Data rings
- **Four Calendar Types**: Month Names, Week Numbers, Day Numbers, Quarters
- **Configuration-Driven**: Complete control via configuration object
- **Modular Architecture**: Clean separation of concerns
- **Event Arc Rendering**: Beautiful curved event visualizations
- **Interactive**: Hover effects, click handlers, detail panels
- **Timeline Indicator**: Real-time date marker
- **Responsive**: SVG-based, scales perfectly

## 📦 Installation

### Browser (No Build Step)

```html
<!-- Load modules in order -->
<script src="layout-calculator.js"></script>
<script src="config-parser.js"></script>
<script src="base-ring.js"></script>
<script src="calendar-ring.js"></script>
<script src="header-ring.js"></script>
<script src="data-ring.js"></script>
<script src="ring-factory.js"></script>
<script src="circalify-core.js"></script>
<script src="circalify.js"></script>
```

### NPM/Module Bundler

```javascript
import { AnnualWheel } from './circalify.js';
```

## 🚀 Quick Start

```javascript
const config = {
  title: "My Annual Wheel",
  startYear: 2025,
  startMonth: 0,
  numberOfMonths: 12,
  sameRingHeight: false,

  rings: [
    // Innermost ring (index 0)
    {
      type: "data",
      name: "Events",
      color: "#b8e6e6",
      unit: "day",
      height: 20,
      fontSize: 10,
      fontColor: "#333"
    },
    // Middle ring
    {
      type: "calendar",
      calendarType: "Month Names",
      showYear: true,
      color: "#ffd4d4",
      height: 15,
      separator: true,
      fontSize: 11,
      fontColor: "#333"
    },
    // Outermost ring (index 2)
    {
      type: "header",
      headerText: "2025 Overview",
      cells: 12,
      color: "#d4f4f4",
      height: 10,
      fontSize: 10,
      fontColor: "#5090d3"
    }
  ]
};

const wheel = new AnnualWheel('#container', config);

// Add data to DataRings
const events = [
  {
    label: "Q1 Planning",
    startDate: "2025-01-06",
    endDate: "2025-01-12",
    color: "#5090d3"
  }
];

wheel.setData(events);
```

## 📖 API Reference

### General Configuration

```javascript
{
  // Title and calendar settings
  title: string,
  calendarSettings: 'static' | 'rolling',
  discRetention: 'with-year' | 'without-year',
  startYear: number,
  startMonth: number (0-11),
  numberOfMonths: number,

  // Visual settings
  colorPalette: string[],
  sameRingHeight: boolean,
  innerRadius: number,
  outerRadius: number,
  viewBoxPadding: number,
  backgroundColor: string,
  fontFamily: string,

  // Features
  showTimeline: boolean,
  enableZoom: boolean,
  enableDetailPanel: boolean,
  interactive: boolean,

  // Rings array
  rings: RingConfig[]
}
```

### Ring Types

#### CalendarRing

```javascript
{
  type: "calendar",
  active: boolean,
  calendarType: "Month Names" | "Week Numbers" | "Day Numbers" | "Quarters",
  showYear: boolean,
  color: string,
  height: number,
  separator: boolean,
  fontSize: number,
  fontColor: string,
  fontWeight: string
}
```

**Calendar Types:**
- **Month Names**: Displays 12 month segments with labels (Jan, Feb, etc.)
- **Week Numbers**: Displays 52 week segments with week numbers
- **Day Numbers**: Displays day-of-year labels (1-365)
- **Quarters**: Displays 4 quarter segments (Q1, Q2, Q3, Q4)

#### HeaderRing

```javascript
{
  type: "header",
  active: boolean,
  headerText: string,
  separator: boolean,
  cells: number,
  color: string,
  height: number,
  fontSize: number,
  fontColor: string,
  fontWeight: string
}
```

#### DataRing

```javascript
{
  type: "data",
  active: boolean,
  name: string,
  color: string,
  unit: "day" | "week" | "month" | "quarter" | "year",
  height: number,
  fontSize: number,
  fontColor: string,
  fontWeight: string,
  showLabels: boolean,
  interactive: boolean
}
```

### Methods

```javascript
// Set/update data for DataRings
wheel.setData(events, ringName?)

// Get all rings
wheel.getRings()

// Get specific ring by name
wheel.getRing(name)

// Get all DataRings
wheel.getDataRings()

// Get configuration
wheel.getConfig()

// Destroy visualization
wheel.destroy()

// Static methods
AnnualWheel.getAvailableRingTypes()
AnnualWheel.getAvailableCalendarTypes()
```

## 🎨 Examples

### Example 1: Simple 3-Ring Setup

```javascript
const config = {
  title: "Simple Annual Wheel",
  startYear: 2025,
  rings: [
    {
      type: "data",
      name: "Events",
      color: "#b8e6e6",
      height: 20
    },
    {
      type: "calendar",
      calendarType: "Month Names",
      color: "#ffd4d4",
      height: 15
    },
    {
      type: "header",
      headerText: "2025",
      cells: 4,
      color: "#d4f4f4",
      height: 10
    }
  ]
};
```

### Example 2: Complex Multi-Ring Setup

```javascript
const config = {
  title: "Complex Annual Wheel",
  startYear: 2025,
  sameRingHeight: false,
  rings: [
    { type: "data", name: "Core", height: 18, color: "#e3f2fd" },
    { type: "calendar", calendarType: "Week Numbers", height: 12, color: "#fff3e0" },
    { type: "header", headerText: "Q1", cells: 4, height: 8, color: "#f3e5f5" },
    { type: "data", name: "Secondary", height: 15, color: "#e8f5e9" },
    { type: "calendar", calendarType: "Quarters", height: 10, color: "#fce4ec" },
    { type: "header", headerText: "2025", cells: 12, height: 8, color: "#e0f2f1" }
  ]
};
```

### Example 3: All Calendar Types

```javascript
// Month Names
{ type: "calendar", calendarType: "Month Names", showYear: true }

// Week Numbers
{ type: "calendar", calendarType: "Week Numbers", showYear: true }

// Day Numbers
{ type: "calendar", calendarType: "Day Numbers", showYear: true }

// Quarters
{ type: "calendar", calendarType: "Quarters", showYear: true }
```

## 🏗️ Architecture

```
circalify/
├── config-parser.js       # Configuration validation
├── layout-calculator.js   # Ring dimension calculations
├── base-ring.js          # Abstract base class
├── calendar-ring.js      # Calendar ring renderer
├── header-ring.js        # Header ring renderer
├── data-ring.js          # Data/event ring renderer
├── ring-factory.js       # Ring creation factory
├── circalify-core.js     # Main orchestrator
└── circalify.js          # Public API entry point
```

## 🎯 Ring Order

Rings are rendered **inside-to-outside**:
- Index 0 = Innermost ring
- Index 1 = Next ring outward
- Index N = Outermost ring

```javascript
rings: [
  { type: "data" },    // Ring 0 - Innermost
  { type: "calendar" }, // Ring 1 - Middle
  { type: "header" }   // Ring 2 - Outermost
]
```

## 📊 Data Format

Events for DataRing:

```javascript
{
  label: string,           // Event label
  startDate: string,       // ISO date "YYYY-MM-DD"
  endDate: string,         // ISO date "YYYY-MM-DD"
  color: string,          // Hex color
  description: string,    // Optional description
  id: string             // Optional unique ID
}
```

## 🎨 Styling

All visual properties are configurable:
- Ring colors
- Font sizes and colors
- Font weights
- Ring heights (proportional or equal)
- Separators between segments

## 🔧 Advanced Usage

### Multiple DataRings with Separate Data

**IMPORTANT**: Each DataRing can have its own independent event data!

```javascript
// Define separate event arrays
const coreEvents = [
  { label: "Board Meeting", startDate: "2025-01-15", endDate: "2025-01-16", color: "#1976d2" },
  { label: "Q1 Review", startDate: "2025-03-20", endDate: "2025-03-22", color: "#1976d2" }
];

const secondaryEvents = [
  { label: "Team Workshop", startDate: "2025-02-10", endDate: "2025-02-12", color: "#2e7d32" },
  { label: "Training", startDate: "2025-04-15", endDate: "2025-04-20", color: "#388e3c" }
];

// Configure multiple DataRings
const config = {
  rings: [
    { type: "data", name: "Core Events", height: 20, color: "#e3f2fd" },
    { type: "calendar", calendarType: "Month Names", height: 15 },
    { type: "data", name: "Secondary Events", height: 18, color: "#e8f5e9" }
  ]
};

const wheel = new AnnualWheel('#container', config);

// Load different data into each DataRing BY NAME
wheel.setData(coreEvents, "Core Events");
wheel.setData(secondaryEvents, "Secondary Events");
```

### Dynamic Updates

```javascript
// Update all DataRings
wheel.setData(newEvents);

// Update specific DataRing by name
wheel.setData(newEvents, "Core Events");
```

### Accessing Ring Instances

```javascript
const rings = wheel.getRings();
const dataRings = wheel.getDataRings();
const specificRing = wheel.getRing("Events");
```

### Destroying

```javascript
wheel.destroy();
```

## 🚧 Migration from 1.0

**Breaking Changes:**
- Complete configuration API rewrite
- Ring-based system (no hardcoded rings)
- New event data format required
- Different initialization syntax

**See demo files for migration examples.**

## 📝 License

MIT License

## 🤝 Contributing

This is a refactored version with a modular architecture. Contributions welcome!

## 📚 Examples

See included demo file:
- `demo-plandisc.html` - Complete demonstration of all features

## 🎉 Version

Current version: **2.0.0**

Complete rewrite with flexible ring system.
