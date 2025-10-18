# Circalify 2.0 - Quick Start Guide

## 📦 Setup (30 seconds)

### 1. Include the Scripts

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Annual Wheel</title>
  <style>
    #container { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="container"></div>

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
</body>
</html>
```

### 2. Create Configuration

```javascript
const config = {
  title: "My Annual Wheel 2025",
  startYear: 2025,
  startMonth: 0,        // January
  numberOfMonths: 12,
  sameRingHeight: false,

  rings: [
    // Ring 0 - Innermost: Your events
    {
      type: "data",
      name: "My Events",
      color: "#b8e6e6",
      height: 20,
      fontSize: 10,
      fontColor: "#333"
    },

    // Ring 1 - Middle: Calendar
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

    // Ring 2 - Outermost: Header
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
```

### 3. Create Events

```javascript
const events = [
  {
    label: "Team Meeting",
    startDate: "2025-01-15",
    endDate: "2025-01-16",
    color: "#5090d3",
    description: "Monthly team sync"
  },
  {
    label: "Product Launch",
    startDate: "2025-03-01",
    endDate: "2025-03-07",
    color: "#d89b7d"
  },
  {
    label: "Summer Break",
    startDate: "2025-07-01",
    endDate: "2025-07-31",
    color: "#88c7d0"
  }
];
```

### 4. Initialize

```javascript
const wheel = new AnnualWheel('#container', config);
wheel.setData(events);
```

## ✅ Done!

Open in browser and you'll see your annual wheel with:
- Events displayed in the inner ring
- Month names in the middle ring
- Header text in the outer ring
- Interactive hover/click effects
- Current date timeline

## 🎨 Customize

### Change Calendar Type

```javascript
{
  type: "calendar",
  calendarType: "Week Numbers",  // or "Day Numbers", "Quarters"
  ...
}
```

### Add More Rings

```javascript
rings: [
  { type: "data", name: "Work", height: 15 },
  { type: "data", name: "Personal", height: 15 },
  { type: "calendar", calendarType: "Months", height: 12 },
  { type: "header", headerText: "Q1", cells: 4, height: 8 },
  { type: "header", headerText: "2025", cells: 12, height: 8 }
]
```

### Update Data Dynamically

```javascript
// Add new event
const newEvents = [...events, {
  label: "New Event",
  startDate: "2025-12-25",
  endDate: "2025-12-25",
  color: "#ff6b6b"
}];

wheel.setData(newEvents);
```

### Equal Ring Heights

```javascript
sameRingHeight: true  // All rings get equal height
```

## 🎯 Calendar Types

### Month Names
```javascript
calendarType: "Month Names"
```
Displays: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec

### Week Numbers
```javascript
calendarType: "Week Numbers"
```
Displays: 1, 2, 3, ... 52 (weeks of the year)

### Day Numbers
```javascript
calendarType: "Day Numbers"
```
Displays: 1, 5, 10, 15, ... 365 (days of the year)

### Quarters
```javascript
calendarType: "Quarters"
```
Displays: Q1, Q2, Q3, Q4 with month subdivisions

## 🔧 Common Patterns

### 3-Ring Setup (Simple)
```javascript
rings: [
  { type: "data", name: "Events", height: 20 },
  { type: "calendar", calendarType: "Month Names", height: 15 },
  { type: "header", headerText: "2025", cells: 12, height: 10 }
]
```

### 5-Ring Setup (Complex)
```javascript
rings: [
  { type: "data", name: "Core", height: 18 },
  { type: "calendar", calendarType: "Week Numbers", height: 12 },
  { type: "header", headerText: "PLANNING", cells: 4, height: 8 },
  { type: "data", name: "Secondary", height: 15 },
  { type: "header", headerText: "2025", cells: 12, height: 8 }
]
```

### Multi-DataRing (Each Ring Has Its Own Events!)
```javascript
// Define separate event arrays for each DataRing
const workEvents = [
  { label: "Meeting", startDate: "2025-01-15", endDate: "2025-01-16", color: "#5090d3" },
  { label: "Deadline", startDate: "2025-03-01", endDate: "2025-03-01", color: "#d89b7d" }
];

const personalEvents = [
  { label: "Birthday", startDate: "2025-02-10", endDate: "2025-02-10", color: "#88c7d0" },
  { label: "Vacation", startDate: "2025-07-01", endDate: "2025-07-15", color: "#ffa07a" }
];

// Configure multiple DataRings
rings: [
  { type: "data", name: "Work", height: 15, color: "#e3f2fd" },
  { type: "calendar", calendarType: "Months", height: 12 },
  { type: "data", name: "Personal", height: 15, color: "#e8f5e9" }
]

// IMPORTANT: Load different data into each DataRing by name
wheel.setData(workEvents, "Work");
wheel.setData(personalEvents, "Personal");
```

## 📚 Next Steps

1. Check out the demo file:
   - `demo-plandisc.html` - Complete demonstration of all features

2. Read full documentation:
   - `README.md` - Complete API reference
   - `MULTI_DATARING_GUIDE.md` - Guide for using multiple DataRings

3. Explore examples:
   - Try different calendar types
   - Experiment with ring combinations
   - Add multiple DataRings with different event sets
   - Customize colors and sizes

## ❓ Common Questions

**Q: How many rings can I add?**
A: Unlimited! Add as many as you need.

**Q: Can I have multiple data rings?**
A: Yes! Give each a unique name and load data separately.

**Q: Can I change calendar type after creation?**
A: Yes, update config and reinitialize the wheel.

**Q: How do I hide a ring?**
A: Set `active: false` in the ring config.

**Q: Can I customize colors?**
A: Yes, every ring has `color`, `fontSize`, `fontColor` properties.

## 🎉 You're Ready!

Start building your circular annual calendar visualization!

For more details, see:
- `README.md` - Full API documentation
- `MULTI_DATARING_GUIDE.md` - Multi-ring usage guide
