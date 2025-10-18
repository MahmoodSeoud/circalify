# Multiple DataRings - Complete Guide

## 🎯 Key Concept

**Each DataRing can have its own independent event data!**

This is a powerful feature that allows you to organize different types of events into separate visual rings, each maintaining its own dataset.

## 📊 Use Cases

### 1. **Work vs Personal**
- Inner Ring: Work events (meetings, deadlines, projects)
- Outer Ring: Personal events (birthdays, vacations, hobbies)

### 2. **Strategic Levels**
- Inner Ring: Executive/Board level events
- Middle Ring: Project milestones
- Outer Ring: Team activities

### 3. **Departments**
- Ring 1: Engineering team events
- Ring 2: Marketing campaigns
- Ring 3: Sales activities
- Ring 4: HR events

### 4. **Priority Levels**
- Inner Ring: Critical/High priority
- Middle Ring: Medium priority
- Outer Ring: Low priority / Optional

## 🚀 Implementation

### Step 1: Define Separate Event Arrays

```javascript
// Define events for each ring separately
const executiveEvents = [
  {
    label: "Board Meeting",
    startDate: "2025-01-15",
    endDate: "2025-01-16",
    color: "#1976d2",
    description: "Quarterly board meeting"
  },
  {
    label: "Annual Review",
    startDate: "2025-03-20",
    endDate: "2025-03-22",
    color: "#1565c0",
    description: "Annual performance review"
  }
];

const projectEvents = [
  {
    label: "Product Launch",
    startDate: "2025-05-10",
    endDate: "2025-05-15",
    color: "#f57c00",
    description: "Major product launch"
  },
  {
    label: "Beta Release",
    startDate: "2025-08-01",
    endDate: "2025-08-05",
    color: "#ef6c00",
    description: "Beta version release"
  }
];

const teamEvents = [
  {
    label: "Team Workshop",
    startDate: "2025-02-10",
    endDate: "2025-02-12",
    color: "#388e3c",
    description: "Team building workshop"
  },
  {
    label: "Training Camp",
    startDate: "2025-07-01",
    endDate: "2025-07-05",
    color: "#43a047",
    description: "Summer training camp"
  }
];
```

### Step 2: Configure Multiple DataRings

```javascript
const config = {
  title: "Multi-Level Annual Wheel",
  startYear: 2025,
  sameRingHeight: false, // Use proportional heights

  rings: [
    // Ring 0 - Innermost: Executive Events
    {
      type: "data",
      name: "Executive",           // IMPORTANT: Unique name
      color: "#e3f2fd",
      height: 20,
      fontSize: 10,
      fontColor: "#0d47a1"
    },

    // Ring 1: Project Events
    {
      type: "data",
      name: "Projects",             // IMPORTANT: Unique name
      color: "#fff3e0",
      height: 18,
      fontSize: 9,
      fontColor: "#e65100"
    },

    // Ring 2: Team Events
    {
      type: "data",
      name: "Team",                 // IMPORTANT: Unique name
      color: "#e8f5e9",
      height: 16,
      fontSize: 9,
      fontColor: "#1b5e20"
    },

    // Ring 3 - Outermost: Calendar
    {
      type: "calendar",
      calendarType: "Month Names",
      height: 12
    }
  ]
};
```

### Step 3: Load Data into Each Ring

```javascript
const wheel = new AnnualWheel('#container', config);

// Load different data into each DataRing BY NAME
wheel.setData(executiveEvents, "Executive");
wheel.setData(projectEvents, "Projects");
wheel.setData(teamEvents, "Team");

// That's it! Each ring now has its own independent events
```

## 🔍 How It Works

### The Magic: Ring Name Targeting

When you call `wheel.setData(events, ringName)`, the library:

1. **Finds the DataRing** with the matching name
2. **Clears existing events** in that specific ring
3. **Loads new events** into that ring only
4. **Other rings remain unchanged**

### Without Ring Name (Updates All)

```javascript
// This updates ALL DataRings with the same data
wheel.setData(events);
```

### With Ring Name (Updates Specific Ring)

```javascript
// This updates ONLY the "Executive" ring
wheel.setData(executiveEvents, "Executive");

// This updates ONLY the "Projects" ring
wheel.setData(projectEvents, "Projects");
```

## 💡 Best Practices

### 1. **Give Each Ring a Unique Name**

```javascript
// ✅ Good - Unique names
{ type: "data", name: "Executive" }
{ type: "data", name: "Projects" }
{ type: "data", name: "Team" }

// ❌ Bad - Duplicate names
{ type: "data", name: "Events" }
{ type: "data", name: "Events" }  // Same name!
```

### 2. **Use Descriptive Names**

```javascript
// ✅ Good - Clear purpose
{ type: "data", name: "Board Meetings" }
{ type: "data", name: "Product Milestones" }
{ type: "data", name: "Team Activities" }

// ⚠️ Okay but vague
{ type: "data", name: "Ring 1" }
{ type: "data", name: "Ring 2" }
```

### 3. **Color Code by Category**

```javascript
// Executive - Blues
{ type: "data", name: "Executive", color: "#e3f2fd", fontColor: "#0d47a1" }

// Projects - Oranges
{ type: "data", name: "Projects", color: "#fff3e0", fontColor: "#e65100" }

// Team - Greens
{ type: "data", name: "Team", color: "#e8f5e9", fontColor: "#1b5e20" }
```

### 4. **Organize Inner to Outer**

```javascript
// Inner = Most important/strategic
// Outer = Less critical/more detailed

rings: [
  { type: "data", name: "Strategic" },      // Innermost
  { type: "data", name: "Tactical" },       // Middle
  { type: "data", name: "Operational" },    // Outer
  { type: "calendar", ... }                 // Outermost
]
```

## 🎨 Visual Organization Tips

### By Priority

```javascript
rings: [
  { type: "data", name: "Critical", color: "#ffebee" },    // Red tones
  { type: "data", name: "High", color: "#fff3e0" },        // Orange tones
  { type: "data", name: "Medium", color: "#fff9c4" },      // Yellow tones
  { type: "data", name: "Low", color: "#e8f5e9" }          // Green tones
]
```

### By Timeline

```javascript
rings: [
  { type: "data", name: "Past", color: "#f5f5f5" },       // Gray
  { type: "data", name: "Current", color: "#e3f2fd" },    // Blue - emphasized
  { type: "data", name: "Future", color: "#f3e5f5" }      // Purple
]
```

### By Department

```javascript
rings: [
  { type: "data", name: "Engineering", color: "#e3f2fd" },  // Blue
  { type: "data", name: "Design", color: "#f3e5f5" },       // Purple
  { type: "data", name: "Marketing", color: "#fff3e0" },    // Orange
  { type: "data", name: "Sales", color: "#e8f5e9" }         // Green
]
```

## 📈 Dynamic Updates

### Update Specific Ring

```javascript
// Add new event to Executive ring only
const updatedExecutiveEvents = [
  ...executiveEvents,
  {
    label: "Emergency Meeting",
    startDate: "2025-11-15",
    endDate: "2025-11-15",
    color: "#c62828"
  }
];

wheel.setData(updatedExecutiveEvents, "Executive");
// Only Executive ring updates, others unchanged!
```

### Update Multiple Rings

```javascript
// Update both Executive and Projects
wheel.setData(newExecutiveEvents, "Executive");
wheel.setData(newProjectEvents, "Projects");
// Team ring remains unchanged
```

### Update All Rings at Once

```javascript
// Load same events into all DataRings
const allEvents = [...executiveEvents, ...projectEvents, ...teamEvents];
wheel.setData(allEvents);
// All DataRings now show all events (usually not what you want!)
```

## 🎯 Complete Example

```javascript
// 1. Define separate event arrays
const workEvents = [
  { label: "Sprint Planning", startDate: "2025-01-08", endDate: "2025-01-09", color: "#1976d2" },
  { label: "Code Review", startDate: "2025-02-15", endDate: "2025-02-16", color: "#1565c0" }
];

const personalEvents = [
  { label: "Birthday", startDate: "2025-03-10", endDate: "2025-03-10", color: "#388e3c" },
  { label: "Vacation", startDate: "2025-07-01", endDate: "2025-07-15", color: "#43a047" }
];

// 2. Configure with multiple DataRings
const config = {
  title: "Work & Life Balance",
  startYear: 2025,
  rings: [
    { type: "data", name: "Work", color: "#e3f2fd", height: 20 },
    { type: "calendar", calendarType: "Month Names", height: 12 },
    { type: "data", name: "Personal", color: "#e8f5e9", height: 18 }
  ]
};

// 3. Initialize
const wheel = new AnnualWheel('#container', config);

// 4. Load separate data
wheel.setData(workEvents, "Work");
wheel.setData(personalEvents, "Personal");

// 5. Later: Update work events only
const newWorkEvents = [
  ...workEvents,
  { label: "Team Meeting", startDate: "2025-04-20", endDate: "2025-04-20", color: "#0d47a1" }
];
wheel.setData(newWorkEvents, "Work");
// Personal events unchanged!
```

## 📚 Demo Files

Check out these demo files to see multi-DataRing in action:

1. **demo-multi-dataring.html** - Full example with 3 DataRings
   - Core Events (6 events)
   - Project Events (5 events)
   - Team Events (7 events)
   - Each ring maintains its own data!

2. **demo-showcase.html** - Interactive showcase
   - 2 DataRings with separate data
   - Calendar type switching
   - Live updates

## ❓ FAQ

**Q: How many DataRings can I have?**
A: As many as you want! No hard limit.

**Q: Can I have DataRings in any position?**
A: Yes! DataRings can be anywhere in the ring order.

**Q: Do all DataRings need unique names?**
A: Strongly recommended! Without unique names, you can't target specific rings.

**Q: Can I update just one ring without affecting others?**
A: Yes! That's the whole point. Use `wheel.setData(events, ringName)`.

**Q: What if I don't provide a ring name?**
A: All DataRings will be updated with the same data.

**Q: Can I mix DataRings with other ring types?**
A: Absolutely! Mix and match in any order:
```javascript
rings: [
  { type: "data" },
  { type: "calendar" },
  { type: "data" },
  { type: "header" },
  { type: "data" }
]
```

## 🎉 Summary

Multiple DataRings with independent data is one of the most powerful features of Circalify 2.0:

✅ **Organize events by category**
✅ **Separate personal/work events**
✅ **Show different priority levels**
✅ **Display departmental activities**
✅ **Update rings independently**
✅ **Mix with calendar and header rings**
✅ **Unlimited combinations**

Start using multiple DataRings today to create rich, multi-layered annual visualizations!
