# Circalify Configuration Guide

Complete reference for all configuration options in the Circalify annual wheel visualization system.

---

## Table of Contents

1. [General Configuration](#general-configuration)
2. [Ring Types](#ring-types)
   - [Calendar Ring](#calendar-ring)
   - [Header Ring](#header-ring)
   - [Data Ring](#data-ring)
3. [Ring Ordering](#ring-ordering)
4. [Complete Examples](#complete-examples)

---

## General Configuration

These settings apply to the entire wheel visualization:

```javascript
{
  title: string,                    // Title displayed above wheel
  calendarSettings: enum,           // How the calendar behaves
  discRetention: enum,              // How disc rotates
  startYear: number,                // Year to start from (e.g., 2025)
  startMonth: number,               // Month to start from (0-11, where 0 = January)
  numberOfMonths: number,           // How many months to display (typically 12)
  colorPalette: string[],           // Array of color hex codes
  sameRingHeight: boolean,          // true = all rings equal height
  rings: RingConfig[]               // Array of ring configurations
}
```

### Option Details

#### `title`
- **Type:** `string`
- **Default:** `"Annual Wheel"`
- **Description:** Text displayed in the header above the wheel

#### `calendarSettings`
- **Type:** `enum`
- **Options:**
  - `"static"` - Fixed calendar view
  - `"rolling"` - Rolling/sliding calendar view
- **Default:** `"static"`

#### `discRetention`
- **Type:** `enum`
- **Options:**
  - `"with-year"` - Clockwise rotation with year progression
  - `"counter-clockwise"` - Counter-clockwise rotation
- **Default:** `"with-year"`

#### `startYear`
- **Type:** `number`
- **Default:** Current year
- **Example:** `2025`

#### `startMonth`
- **Type:** `number`
- **Range:** `0-11` (0 = January, 11 = December)
- **Default:** `0`

#### `numberOfMonths`
- **Type:** `number`
- **Range:** `1-60`
- **Default:** `12`

#### `colorPalette`
- **Type:** `string[]`
- **Default:** `["#b8e6e6", "#ffd4d4", "#d4e8e0", "#f0dcd4"]`
- **Description:** Array of hex color codes used throughout the visualization
- **Example:**
  ```javascript
  colorPalette: [
    "#FF6B6B",  // Coral
    "#4ECDC4",  // Turquoise
    "#98D8C8",  // Mint
    "#F5E6D3",  // Cream
    "#FFB3BA"   // Pink
  ]
  ```

#### `sameRingHeight`
- **Type:** `boolean`
- **Default:** `true`
- **Options:**
  - `true` - All rings have equal height (ignore individual `height` values)
  - `false` - Rings use their individual `height` values proportionally

---

## Ring Types

You can add any number of rings in any order. Three ring types are supported:

### Calendar Ring

Displays calendar divisions (months, weeks, days, quarters).

```javascript
{
  type: "calendar",
  active: boolean,
  calendarType: enum,
  showYear: boolean,        // Only for calendarType: "month-names"
  color: string,
  height: number,
  separator: boolean,
  fontSize: number,
  fontColor: string
}
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `"calendar"` | - | **Required.** Ring type identifier |
| `active` | `boolean` | `true` | Whether this ring is visible |
| `calendarType` | `enum` | `"month-names"` | What calendar divisions to show |
| `showYear` | `boolean` | `true` | **Only for "month-names".** Display year on every month label (e.g., "Jan 2025", "Feb 2025") |
| `color` | `string` | `"#CCCCCC"` | Background color (hex code) |
| `height` | `number` | `10` | Ring height (used if `sameRingHeight = false`) |
| `separator` | `boolean` | `true` | Show separator lines between segments |
| `fontSize` | `number` | `11` | Font size for text in this ring |
| `fontColor` | `string` | `"#333333"` | Font color (hex code) |

#### Calendar Types

| Value | Description |
|-------|-------------|
| `"month-names"` | Shows month names (Jan, Feb, Mar...) |
| `"weeks"` | Shows week numbers (1-52) |
| `"days"` | Shows individual day numbers (1-365) |
| `"quarters"` | Shows quarters (Q1, Q2, Q3, Q4) |

#### Example

```javascript
{
  type: "calendar",
  active: true,
  calendarType: "month-names",
  showYear: true,              // Displays "Jan 2025", "Feb 2025", etc.
  color: "#F0F0F0",
  height: 5,
  separator: true,
  fontSize: 11,
  fontColor: "#4A4A4A"
}
```

**Note**: The `showYear` option only works with `calendarType: "month-names"`. If specified for other calendar types, it will be ignored with a console warning.

---

### Header Ring

Displays a static header/label divided into equal cells.

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
  fontColor: string
}
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `"header"` | - | **Required.** Ring type identifier |
| `active` | `boolean` | `true` | Whether this ring is visible |
| `headerText` | `string` | - | **Required.** Text to display (e.g., "Board Meetings") |
| `separator` | `boolean` | `true` | Show separator lines between cells |
| `cells` | `number` | `12` | Number of equal segments to divide ring into |
| `color` | `string` | `"#4ECDC4"` | Background color (hex code) |
| `height` | `number` | `15` | Ring height (used if `sameRingHeight = false`) |
| `fontSize` | `number` | `10` | Font size for header text |
| `fontColor` | `string` | `"#FFFFFF"` | Font color (hex code) |

#### Example

```javascript
{
  type: "header",
  active: true,
  headerText: "Board Meetings",
  separator: false,
  cells: 5,
  color: "#FFFFFF",
  height: 5,
  fontSize: 10,
  fontColor: "#4ECDC4"
}
```

**Visual Result:** Ring divided into 5 equal segments, each displaying "Board Meetings"

---

### Data Ring

Displays actual data/events positioned according to dates.

```javascript
{
  type: "data",
  active: boolean,
  name: string,
  color: string,
  unit: enum,
  height: number,
  fontSize: number,
  fontColor: string
}
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `"data"` | - | **Required.** Ring type identifier |
| `active` | `boolean` | `true` | Whether this ring is visible |
| `name` | `string` | Auto-generated | Name/identifier for this data ring |
| `color` | `string` | `"#FF6B6B"` | Background/default color (hex code) |
| `unit` | `enum` | `"day"` | Time unit granularity for data positioning |
| `height` | `number` | `15` | Ring height (used if `sameRingHeight = false`) |
| `fontSize` | `number` | `10` | Font size for data labels |
| `fontColor` | `string` | `"#000000"` | Font color (hex code) |

#### Time Units

| Value | Description |
|-------|-------------|
| `"day"` | Position data by individual day |
| `"week"` | Position data by week (7-day periods) |
| `"month"` | Position data by calendar month |
| `"quarter"` | Position data by quarter (3-month periods) |

#### Example

```javascript
{
  type: "data",
  active: true,
  name: "Meeting Events",
  color: "#4ECDC4",
  unit: "day",
  height: 15,
  fontSize: 10,
  fontColor: "#FFFFFF"
}
```

**Note:** Actual data/events are passed separately via the `setData()` method.

---

## Ring Ordering

**CRITICAL:** Rings are rendered **in the order they appear in the rings[] array**.

- **First ring in array** = Innermost ring (closest to center)
- **Last ring in array** = Outermost ring (closest to edge)
- You can mix and match ring types in **any order**

### Examples

#### Example 1: Calendar inside, then data, then header
```javascript
rings: [
  { type: "calendar", calendarType: "month-names", ... },
  { type: "data", name: "Events", ... },
  { type: "header", headerText: "Board Meetings", ... }
]
```

#### Example 2: Multiple data rings
```javascript
rings: [
  { type: "calendar", calendarType: "month-names", ... },
  { type: "data", name: "Events", ... },
  { type: "data", name: "Deadlines", ... },
  { type: "data", name: "Meetings", ... }
]
```

#### Example 3: Header first, then everything else
```javascript
rings: [
  { type: "header", headerText: "2025 Overview", ... },
  { type: "calendar", calendarType: "quarters", ... },
  { type: "data", name: "Strategic Initiatives", ... }
]
```

---

## Complete Examples

### Example 1: Board Meeting Tracker

```javascript
const config = {
  title: "Board Annual Wheel 2025",
  calendarSettings: "static",
  discRetention: "with-year",
  startYear: 2025,
  startMonth: 0,
  numberOfMonths: 12,
  colorPalette: [
    "#FF6B6B",
    "#4ECDC4",
    "#98D8C8",
    "#F5E6D3",
    "#FFB3BA"
  ],
  sameRingHeight: false,

  rings: [
    // Inner: Calendar with month names
    {
      type: "calendar",
      active: true,
      calendarType: "month-names",
      showYear: true,
      color: "#F0F0F0",
      height: 5,
      separator: true,
      fontSize: 11,
      fontColor: "#4A4A4A"
    },

    // Middle: Header for categories
    {
      type: "header",
      active: true,
      headerText: "Board Meetings",
      separator: false,
      cells: 5,
      color: "#FFFFFF",
      height: 5,
      fontSize: 10,
      fontColor: "#4ECDC4"
    },

    // Outer: Data ring for events
    {
      type: "data",
      active: true,
      name: "Meeting Events",
      color: "#4ECDC4",
      unit: "day",
      height: 15,
      fontSize: 10,
      fontColor: "#FFFFFF"
    }
  ]
};

const wheel = new AnnualWheel('#container', config);

// Add event data
wheel.setData([
  {
    id: 1,
    label: "Q1 Board Meeting",
    startDate: "2025-01-15",
    endDate: "2025-01-15",
    color: "#FF6B6B"
  },
  {
    id: 2,
    label: "Strategic Planning",
    startDate: "2025-02-10",
    endDate: "2025-02-12",
    color: "#4ECDC4"
  }
]);
```

### Example 2: Project Timeline

```javascript
const config = {
  title: "Project Timeline 2025",
  calendarSettings: "static",
  discRetention: "with-year",
  startYear: 2025,
  startMonth: 0,
  numberOfMonths: 12,
  colorPalette: ["#3498db", "#e74c3c", "#2ecc71", "#f39c12"],
  sameRingHeight: true,  // Equal heights for all rings

  rings: [
    // Week numbers for precise tracking
    {
      type: "calendar",
      active: true,
      calendarType: "weeks",
      showYear: true,
      color: "#ecf0f1",
      height: 10,
      separator: true,
      fontSize: 9,
      fontColor: "#34495e"
    },

    // Phases header
    {
      type: "header",
      active: true,
      headerText: "Project Phases",
      separator: true,
      cells: 4,
      color: "#3498db",
      height: 10,
      fontSize: 11,
      fontColor: "#ffffff"
    },

    // Milestones data ring
    {
      type: "data",
      active: true,
      name: "Milestones",
      color: "#2ecc71",
      unit: "week",
      height: 10,
      fontSize: 10,
      fontColor: "#ffffff"
    },

    // Tasks data ring
    {
      type: "data",
      active: true,
      name: "Tasks",
      color: "#f39c12",
      unit: "day",
      height: 10,
      fontSize: 9,
      fontColor: "#ffffff"
    }
  ]
};
```

### Example 3: Academic Year Planner

```javascript
const config = {
  title: "Academic Year 2024-2025",
  calendarSettings: "static",
  discRetention: "with-year",
  startYear: 2024,
  startMonth: 8,  // September
  numberOfMonths: 12,
  colorPalette: ["#9b59b6", "#e67e22", "#16a085", "#c0392b"],
  sameRingHeight: false,

  rings: [
    // Quarters for term divisions
    {
      type: "calendar",
      active: true,
      calendarType: "quarters",
      showYear: true,
      color: "#f8f9fa",
      height: 8,
      separator: true,
      fontSize: 12,
      fontColor: "#2c3e50"
    },

    // Months for reference
    {
      type: "calendar",
      active: true,
      calendarType: "month-names",
      showYear: false,
      color: "#ecf0f1",
      height: 6,
      separator: true,
      fontSize: 10,
      fontColor: "#7f8c8d"
    },

    // Terms header
    {
      type: "header",
      active: true,
      headerText: "Terms",
      separator: true,
      cells: 3,
      color: "#9b59b6",
      height: 6,
      fontSize: 11,
      fontColor: "#ffffff"
    },

    // Exams and events
    {
      type: "data",
      active: true,
      name: "Academic Events",
      color: "#e67e22",
      unit: "day",
      height: 20,
      fontSize: 10,
      fontColor: "#ffffff"
    }
  ]
};
```

---

## API Reference

### Creating a Wheel

```javascript
const wheel = new AnnualWheel(container, config);
```

- `container`: HTMLElement or CSS selector string (e.g., `'#container'`)
- `config`: Configuration object (see above)

### Setting Data

```javascript
wheel.setData(events);
wheel.setData(events, 'ringName');  // Target specific ring
```

### Getting Information

```javascript
// Get all rings
const rings = wheel.getRings();

// Get specific ring by name
const ring = wheel.getRing('Meeting Events');

// Get only data rings
const dataRings = wheel.getDataRings();

// Get configuration
const config = wheel.getConfig();
```

### Static Methods

```javascript
// Get version
AnnualWheel.version;  // "2.0.0"

// Get available ring types
AnnualWheel.getAvailableRingTypes();
// Returns: ["calendar", "header", "data"]

// Get available calendar types
AnnualWheel.getAvailableCalendarTypes();
// Returns: ["month-names", "weeks", "days", "quarters"]
```

### Destroying a Wheel

```javascript
wheel.destroy();
```

---

## Best Practices

### 1. Ring Height Planning

When `sameRingHeight = false`, plan your heights carefully:

```javascript
// Good: Heights are proportional and meaningful
rings: [
  { type: "calendar", height: 5 },   // Thin calendar reference
  { type: "header", height: 3 },     // Minimal header
  { type: "data", height: 20 }       // Large data display area
]

// Total units: 5 + 3 + 20 = 28
// Calendar will be 5/28 of available space
// Header will be 3/28 of available space
// Data will be 20/28 of available space
```

### 2. Color Coordination

Use your `colorPalette` consistently:

```javascript
{
  colorPalette: ["#FF6B6B", "#4ECDC4", "#98D8C8"],
  rings: [
    { type: "calendar", color: "#98D8C8" },  // Light mint
    { type: "header", color: "#4ECDC4" },    // Turquoise
    { type: "data", color: "#FF6B6B" }       // Coral
  ]
}
```

### 3. Font Sizing

Maintain readable hierarchy:

```javascript
rings: [
  { type: "calendar", fontSize: 11 },  // Standard
  { type: "header", fontSize: 12 },    // Slightly larger
  { type: "data", fontSize: 10 }       // Smaller for dense data
]
```

### 4. Unit Selection

Choose `unit` based on data granularity:

- Use `"day"` for precise event tracking
- Use `"week"` for sprint planning or weekly activities
- Use `"month"` for monthly reports or milestones
- Use `"quarter"` for quarterly objectives

---

## Troubleshooting

### Ring not appearing?

Check that `active: true` is set.

### Unexpected ring order?

Remember: First ring in array = innermost position.

### Heights not changing?

Set `sameRingHeight: false` in general config.

### Calendar type not recognized?

Use kebab-case: `"month-names"`, `"weeks"`, `"days"`, `"quarters"`

---

## Support

For issues or questions, please refer to the demo files:
- `demo-complete-config.html` - Complete configuration example
- `demo-plandisc.html` - Original demo

---

**Version:** 2.0.0
**License:** MIT
