# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PROJECT IDENTITY

**Circalify is a pure JavaScript library for creating circular timeline and calendar visualizations.**

### SPECIFICALLY FOR:
- **Annual wheels** - Visualizing a full year (or multi-month period) in circular format
- **Circular calendars** - Displaying events, deadlines, milestones across time periods
- **Multi-ring temporal visualizations** - Layering different time-based data sets (events, quarters, months, weeks)
- **Time-based circular data** - Any data that needs to be positioned according to dates on a circular timeline

### NOT FOR:
- Generic radial UI layouts or design systems
- Radial menus, navigation, or controls
- Non-temporal circular visualizations (pie charts, radial graphs without time)
- CSS-based radial positioning frameworks
- General-purpose SVG drawing libraries

### CORE FOCUS: TIME AND DATES

**Everything in this library revolves around temporal data representation:**

1. **Input**: Users provide **dates** (startDate, endDate) and the library automatically positions elements on the circle
2. **Calendar Math**: The entire geometry system is driven by day-of-year calculations, not arbitrary angles
3. **Circular Format Purpose**: The circle specifically represents **cyclical time periods** (annual cycles, not just aesthetic layouts)
4. **Event Positioning**: All arc positions are computed from date ranges, not manual angle specifications

**If a feature request doesn't involve dates/time, it's likely out of scope.**

---

## Project Overview

Circalify renders temporal data as concentric rings in SVG format. Three ring types work together:
- **Calendar** rings: Display time divisions (months, weeks, days, quarters)
- **Header** rings: Provide labels and categorical divisions
- **Data** rings: Show events/milestones positioned by their dates

**Key Concept**: Rings are rendered inside-to-outside based on array order. First ring in config = innermost, last = outermost.

## Architecture

### Module Loading Order (Critical)

This is a **vanilla JavaScript library with no build step**. Modules must be loaded in strict dependency order:

```html
<script src="layout-calculator.js"></script>  <!-- 1. Geometry/math utilities -->
<script src="config-parser.js"></script>      <!-- 2. Configuration validation -->
<script src="base-ring.js"></script>          <!-- 3. Abstract base class -->
<script src="calendar-ring.js"></script>      <!-- 4. Calendar ring type -->
<script src="header-ring.js"></script>        <!-- 5. Header ring type -->
<script src="data-ring.js"></script>          <!-- 6. Data ring type -->
<script src="ring-factory.js"></script>       <!-- 7. Factory pattern -->
<script src="circalify-core.js"></script>     <!-- 8. Core orchestrator -->
<script src="circalify.js"></script>          <!-- 9. Public API -->
```

### Core Architecture Pattern

```
ConfigParser → CircalifyCore → RingFactory → [CalendarRing|HeaderRing|DataRing] → BaseRing
                    ↓
              LayoutCalculator (geometry calculations)
```

**Flow**:
1. `ConfigParser` validates and normalizes user config
2. `CircalifyCore` orchestrates SVG creation and ring management
3. `LayoutCalculator` computes ring boundaries (radii) from config
4. `RingFactory` instantiates correct ring type classes
5. Each ring extends `BaseRing` and implements `render()`

### Key Classes

**LayoutCalculator** (static utility for temporal-geometric conversion):
- `calculateRingBoundaries(rings, innerRadius, outerRadius, sameRingHeight)` - Computes inner/outer radii for each ring
- `getMonthSegments(year)`, `getWeekSegments(year)`, `getQuarterSegments(year)` - **Calendar math** (converts calendar periods to day ranges)
- `getDayOfYear(date)`, `getWeekOfYear(date)` - **Date utilities** (temporal calculations)
- `polarToCartesian()`, `createArcPath()`, `createDonutPath()` - **SVG geometry** (converts day ranges to circular arcs)

**ConfigParser**:
- Validates entire configuration object
- Normalizes calendar types from kebab-case (`"month-names"`) to Title Case (`"Month Names"`)
- Returns `{ general: {...}, rings: [...] }`

**BaseRing** (abstract):
- Provides common SVG utilities: `_createSVGElement()`, `_drawRingBackground()`, `_addCurvedLabel()`
- Each subclass must implement `render()`
- Stores `elements[]` array for cleanup on `destroy()`

**Ring Types** (all serve temporal visualization):
- **CalendarRing**: Renders **time divisions** (months, weeks, days, quarters) with curved labels - provides temporal reference frame
- **HeaderRing**: Renders equal cell divisions with repeated text - typically used for categorical time periods (quarters, semesters, fiscal periods)
- **DataRing**: Renders **events positioned by date**, handles temporal overlap stacking - the primary data visualization layer

**CircalifyCore**:
- Creates SVG structure with layered groups: `background`, `rings`, `segments`, `centerInfo`, `timeline`, `controls`, `overlay`
- Manages ring lifecycle (create, render, update, destroy)
- Handles timeline indicator, detail panel, zoom controls
- Provides callbacks for interactivity

**AnnualWheel** (public API):
- Thin wrapper around `CircalifyCore`
- Main methods: `setData(events, ringName?)`, `getRings()`, `destroy()`

## Configuration System

### Calendar Type Normalization

Users can specify calendar types in kebab-case (`"month-names"`, `"weeks"`, `"days"`, `"quarters"`), but internally they're normalized to Title Case (`"Month Names"`, `"Week Numbers"`, etc.) for backward compatibility.

**When adding new calendar types**:
1. Add to `validCalendarTypes` array in `config-parser.js`
2. Add mapping in `_normalizeCalendarType()`
3. Implement rendering in `calendar-ring.js` switch statement

### Ring Height Calculation

When `sameRingHeight = false`, rings use proportional heights:
```javascript
// If heights are [5, 10, 15], total = 30
// Ring 0 gets 5/30 of available space
// Ring 1 gets 10/30 of available space
// Ring 2 gets 15/30 of available space
```

When `sameRingHeight = true`, all active rings get equal height regardless of `height` property.

## SVG Structure

```xml
<svg>
  <defs><!-- Filters, gradients, text paths --></defs>
  <g class="circalify-background"><!-- Background elements --></g>
  <g class="circalify-rings"><!-- Ring backgrounds, separators --></g>
  <g class="circalify-segments"><!-- Event arcs, clickable segments --></g>
  <g class="circalify-centerInfo"><!-- Hover info display --></g>
  <g class="circalify-timeline"><!-- Current date indicator --></g>
  <g class="circalify-controls"><!-- Zoom controls --></g>
  <g class="circalify-overlay"><!-- Overlays --></g>
</svg>
```

**Why this order?** Layers stack bottom-to-top. Overlay must be last for z-index.

## Geometry Fundamentals (DATE-DRIVEN)

**CRITICAL**: All geometry is derived from date calculations, not arbitrary angles.

### Temporal Polar Coordinates
- All angles start at **-π/2** (top of circle) = **January 1st** (or configured start date)
- Positive angles go **clockwise** following the passage of time
- **Day 1 of year = top**, Day 365/366 = wraps back to top (completing the annual cycle)
- Angle is calculated as: `(dayOfYear / daysInYear) * 2π - π/2`

### Date-to-Arc Path Conversion
```javascript
// Arc segment for an event from Jan 10-15 in a 365-day year:
// User provides: startDate: "2025-01-10", endDate: "2025-01-15"
// Library converts to day-of-year: 10, 15
const startAngle = (9 / 365) * 2 * Math.PI - Math.PI / 2;   // Day 10 (0-indexed)
const endAngle = (15 / 365) * 2 * Math.PI - Math.PI / 2;    // Day 15
const arcPath = LayoutCalculator.createArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle);
```

**Users never specify angles directly** - they provide ISO date strings, and the library handles all angle calculations.

### Ring Boundary Example
```javascript
// Available space: 420 - 150 = 270 units
// 3 active rings with heights [10, 15, 20], total = 45
// Ring 0: inner=150, outer=150+(10/45*270)=210
// Ring 1: inner=210, outer=210+(15/45*270)=300
// Ring 2: inner=300, outer=300+(20/45*270)=420
```

## DataRing Event Stacking (TEMPORAL OVERLAP DETECTION)

**Critical feature**: Events that overlap **in time** are stacked vertically within the ring.

This is a **temporal algorithm** - it detects date/time conflicts, not just visual overlaps.

Algorithm (`_calculateEventLayers`):
1. **Convert events to day ranges** - Parse `startDate` and `endDate` to day-of-year integers
2. **Sort by start day**, then duration (longest first) - Time-based sorting
3. **Greedy interval partitioning** - Assign each event to earliest available layer where it doesn't temporally conflict
4. For each event, calculate `totalLayers` = max concurrent temporal overlaps during its date range
5. Divide ring height by `totalLayers` to get layer height

**Why dynamic layer count?** Events only use vertical space when they actually overlap **in time**. A ring with 100 events spanning the full year but no temporal conflicts uses full height for each event.

Example:
- Event A: Jan 10-15
- Event B: Jan 12-18  ← Overlaps with A (days 12-15)
- Event C: Jan 20-25  ← No overlap, can use full height

**This is temporal conflict resolution, not generic layout.** The stacking algorithm exists because multiple events can occur during the same time period.

## Testing

Open demo files in browser:
- `demo-complete-config.html` - Comprehensive config demo with interactive controls
- `demo-plandisc.html` - Original demo

**No build step, no test runner**. Validate by:
1. Opening HTML file in browser
2. Checking console for errors
3. Visually inspecting SVG output

## Common Development Tasks

### Adding a New Ring Type

1. Create `new-ring.js` extending `BaseRing`
2. Implement `render()` method
3. Add to `RingFactory.createRing()` switch statement
4. Add to module load order in HTML demos
5. Update `validRingTypes` in `config-parser.js`
6. Add parser method `_parseNewRing()` in `config-parser.js`

### Adding a New Calendar Type

1. Add to `validCalendarTypes` in `config-parser.js`
2. Add mapping in `_normalizeCalendarType()`
3. Implement `_render<TypeName>()` in `calendar-ring.js`
4. Add case to `render()` switch statement
5. Update `CONFIGURATION.md`

### Modifying Ring Boundaries

All boundary calculations happen in `LayoutCalculator.calculateRingBoundaries()`. This method:
- Filters active rings
- Calculates proportional or equal heights
- Returns array of `{inner, outer, center, height}` objects

**Do not** calculate boundaries in individual ring classes. Always use `LayoutCalculator`.

### Debugging Geometry Issues

1. Check SVG viewBox matches calculated `viewBoxSize`
2. Verify `innerRadius < outerRadius`
3. **Verify date-to-angle conversion**: Confirm event dates convert to correct day-of-year values
4. **Check temporal boundaries**: Ensure event dates fall within `startYear/startMonth/numberOfMonths` range
5. Confirm angles are in radians, not degrees
6. Use browser DevTools to inspect SVG paths and data attributes (`data-day`, `data-week`, etc.)
7. Check `polarToCartesian()` calculations: `x = cx + r*cos(θ)`, `y = cy + r*sin(θ)`

**Most geometry bugs stem from incorrect date parsing or day-of-year calculations, not SVG math.**

## Important Constraints

### Calendar Type Case Sensitivity
User input uses kebab-case (`"month-names"`), but internal rendering expects Title Case (`"Month Names"`). Always use `_normalizeCalendarType()` in parser.

### Ring Ordering
Array index 0 = innermost ring. Users may expect outermost first. Documentation emphasizes this.

### Event Date Format (REQUIRED)
**This is a temporal visualization library** - all DataRing events MUST have dates.

DataRing expects ISO date strings: `"YYYY-MM-DD"`. Parsing happens via `new Date(dateString)`.

Events without valid dates cannot be positioned on the circular timeline and will fail or render incorrectly. This is by design - the library's entire purpose is time-based visualization.

### SVG Namespace
Always create SVG elements with `document.createElementNS('http://www.w3.org/2000/svg', type)`. Do not use `document.createElement()`.

### Module Dependencies
BaseRing depends on LayoutCalculator. Ring types depend on BaseRing. Core depends on everything. Circular dependencies will break the no-build-step architecture.

## Code Philosophy

When writing code or refactoring, think like John Carmack.

## Configuration Reference (TEMPORAL PARAMETERS)

See `CONFIGURATION.md` for complete user-facing documentation of all options.

**Note the temporal nature of configuration:**

Key config structure:
```javascript
{
  // General (TEMPORAL SCOPE)
  title,                    // e.g., "Annual Wheel 2025"
  startYear,                // Which year to visualize (2025, 2024, etc.)
  startMonth,               // Which month to start from (0-11)
  numberOfMonths,           // Time period length (typically 12 for annual)
  calendarSettings,         // "static" | "rolling" (time progression behavior)
  discRetention,            // "with-year" | "counter-clockwise" (time direction)
  colorPalette, sameRingHeight,

  // Rings (inner to outer)
  rings: [
    // TIME REFERENCE LAYER
    { type: "calendar",
      calendarType: "month-names"|"weeks"|"days"|"quarters",  // Temporal granularity
      showYear, color, height, separator, fontSize, fontColor
    },

    // CATEGORICAL TIME LAYER
    { type: "header",
      headerText,
      cells,              // Often matches time periods (4 quarters, 12 months, etc.)
      color, height, fontSize, fontColor
    },

    // EVENT DATA LAYER (DATE-POSITIONED)
    { type: "data",
      name, color,
      unit: "day"|"week"|"month"|"quarter",  // Temporal unit for event positioning
      height, fontSize, fontColor
    }
  ]
}
```

**All configuration serves the goal of temporal data visualization.**
