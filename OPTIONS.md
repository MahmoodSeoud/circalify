# Circalify - Complete Options Reference

All hardcoded values have been removed and made configurable. Here's a complete list of all available options:

## Ring Configuration
- `rings` - Array of ring labels (default: `['Outer', 'Middle', 'Inner']`)
- `ringThickness` - Thickness of each ring in pixels (default: `30`)
- `ringGap` - Gap between rings in pixels (default: `5`)

## Size Configuration
- `innerRadius` - Center circle radius (default: `70`)
- `outerRadius` - Outermost ring radius (default: `280`)
- `viewBoxPadding` - Padding around the viewBox (default: `20`)

## Ring Appearance
- `colors` - Array of colors for each ring (default: `['#c0c0c0', '#9b59b6', '#3498db', '#7fb069', '#d4a5a5', '#95a5a6']`)
- `backgroundColor` - Center circle color (default: `'#e5f5fc'`)
- `strokeColor` - Ring border color (default: `'white'`)
- `strokeWidth` - Ring border width (default: `2`)

## Line Appearance
- `lineColor` - Month divider line color (default: `'#E6E6E6'`)
- `lineWidth` - Month divider line width (default: `1`)
- `accentLineColor` - Accent line color (default: `'gray'`)
- `accentLineWidth` - Accent line width (default: `1`)
- `accentLineRatio` - Ratio of radius for accent line length (default: `0.1`)

## Outer Ring Border
- `outerBorderColor` - Outer circle border color (default: `'#d6d6d6'`)
- `outerBorderWidth` - Outer circle border width (default: `1`)

## Timeline Indicator
- `timelineColor` - Current date line color (default: `'red'`)
- `timelineWidth` - Current date line width (default: `0.5`)

## Labels Configuration
- `showLabels` - Show ring labels (default: `true`)
- `showMonthLabels` - Show month labels (default: `true`)
- `monthLabels` - Array of month labels (default: `['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']`)
- `monthLabelOffset` - Distance of month labels from outer radius (default: `15`)
- `startMonth` - Starting month, 0 = January (default: `0`)

## Font Configuration
- `fontFamily` - Font family for all text (default: `'Arial, sans-serif'`)
- `monthLabelSize` - Font size for month labels (default: `12`)
- `monthLabelColor` - Color for month labels (default: `'black'`)
- `ringLabelSize` - Font size for ring labels (default: `13`)
- `ringLabelColor` - Color for ring labels (default: `'black'`)
- `eventLabelSize` - Font size for event labels (default: `12`)
- `eventLabelColor` - Color for event labels (default: `'white'`)

## Interaction
- `interactive` - Enable interactions (default: `true`)
- `showTooltips` - Show tooltips on hover (default: `true`)
- `showTimeline` - Show current date indicator (default: `true`)

## Zoom Configuration
- `enableZoom` - Enable zoom functionality (default: `false`)
- `zoomLevels` - Available zoom levels in months (default: `[12, 6, 3, 1]`)
- `zoomControlOffset` - Distance of zoom controls from outer radius (default: `40`)
- `zoomControlSize` - Size of zoom control buttons (default: `30`)
- `zoomControlGap` - Gap between zoom buttons (default: `10`)
- `zoomControlColor` - Color of zoom controls (default: `'gray'`)
- `zoomControlBackground` - Background color of zoom buttons (default: `'white'`)
- `zoomControlFontSize` - Font size for +/- symbols (default: `20`)

## Events Configuration
- `eventRadius` - Radius of event circles (default: `15`)
- `eventStrokeColor` - Border color of events (default: `'black'`)
- `eventStrokeWidth` - Border width of events (default: `1`)
- `eventHoverStrokeColor` - Border color on hover (default: `'white'`)
- `eventHoverStrokeWidth` - Border width on hover (default: `3`)

## Event Collision Detection
- `overlapThresholdRatio` - Multiplier of event radius for overlap detection (default: `2.5`)
- `radialOffsetRatio` - Multiplier of event radius for separation distance (default: `1.5`)

## Event Arc
- `eventArcOpacity` - Opacity of arc connecting events (default: `0.3`)

## Tooltip Configuration
- `tooltipBackground` - Tooltip background color (default: `'white'`)
- `tooltipBorderColor` - Tooltip border color (default: `'#333'`)
- `tooltipBorderWidth` - Tooltip border width (default: `2`)
- `tooltipBorderRadius` - Tooltip border radius (default: `4`)
- `tooltipPadding` - Tooltip padding (default: `8`)
- `tooltipFontSize` - Tooltip font size (default: `12`)
- `tooltipZIndex` - Tooltip z-index (default: `1000`)
- `tooltipOffset` - Tooltip distance from cursor (default: `10`)
- `tooltipDateColor` - Color for date/description text (default: `'#666'`)

## Callbacks
- `onEventClick` - Function called when event is clicked
- `onEventHover` - Function called when event is hovered
- `onZoom` - Function called when zoom level changes

## Example Usage

```javascript
const wheel = new Circalify(container, data, {
  // Custom dark theme
  colors: ['#34495e', '#2c3e50', '#1a252f'],
  backgroundColor: '#ecf0f1',
  lineColor: '#7f8c8d',
  timelineColor: '#e74c3c',

  // Custom fonts
  fontFamily: 'Georgia, serif',
  monthLabelSize: 14,
  ringLabelSize: 11,

  // Custom sizes
  innerRadius: 50,
  outerRadius: 200,
  ringThickness: 25,
  ringGap: 8,

  // Event styling
  eventRadius: 12,
  eventHoverStrokeColor: '#e74c3c',
  eventArcOpacity: 0.5,

  // Tooltip styling
  tooltipBackground: '#2c3e50',
  tooltipBorderColor: '#34495e',
  tooltipDateColor: '#95a5a6',

  // Features
  enableZoom: true,
  showTimeline: true
});
```

## Summary

**Total configurable options: 60+**

All previously hardcoded values have been extracted and made configurable, including:
- ✅ All colors (removed all hardcoded hex values)
- ✅ All font settings (family, sizes, colors)
- ✅ All dimensions and sizes
- ✅ All stroke widths and styles
- ✅ All spacing and positioning values
- ✅ All visual properties

The library now has ZERO hardcoded visual properties. Everything can be customized through the options object while maintaining sensible defaults.