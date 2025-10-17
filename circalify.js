/**
 * Circalify - A flexible circular annual wheel visualization library
 * No dependencies, pure JavaScript
 * @license MIT
 */

class Circalify {
  constructor(container, data = [], options = {}) {
    // Validate container
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('Circalify: Valid HTML container element required');
    }

    // Default options with NO hardcoded values
    this.options = {
      // Ring configuration
      rings: options.rings || ['Outer', 'Middle', 'Inner'],
      ringThickness: options.ringThickness || 30,
      ringGap: options.ringGap || 5,

      // Size configuration
      innerRadius: options.innerRadius || 70,
      outerRadius: options.outerRadius || 280,
      viewBoxPadding: options.viewBoxPadding || 20,

      // Visual configuration - Ring appearance
      colors: options.colors || ['#c0c0c0', '#9b59b6', '#3498db', '#7fb069', '#d4a5a5', '#95a5a6'],
      backgroundColor: options.backgroundColor || '#e5f5fc',
      strokeColor: options.strokeColor || 'white',
      strokeWidth: options.strokeWidth || 2,

      // Line appearance
      lineColor: options.lineColor || '#E6E6E6',
      lineWidth: options.lineWidth || 1,
      accentLineColor: options.accentLineColor || 'gray',
      accentLineWidth: options.accentLineWidth || 1,
      accentLineRatio: options.accentLineRatio || 0.1, // How much of radius for accent line

      // Outer ring appearance
      outerBorderColor: options.outerBorderColor || '#d6d6d6',
      outerBorderWidth: options.outerBorderWidth || 1,

      // Timeline appearance
      timelineColor: options.timelineColor || 'red',
      timelineWidth: options.timelineWidth || 0.5,

      // Labels configuration
      showLabels: options.showLabels !== false,
      showMonthLabels: options.showMonthLabels !== false,
      monthLabels: options.monthLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      monthLabelOffset: options.monthLabelOffset || 15, // Distance from outer radius
      startMonth: options.startMonth || 0, // 0 = January

      // Font configuration
      fontFamily: options.fontFamily || 'Arial, sans-serif',
      monthLabelSize: options.monthLabelSize || 12,
      monthLabelColor: options.monthLabelColor || 'black',
      ringLabelSize: options.ringLabelSize || 13,
      ringLabelColor: options.ringLabelColor || 'black',
      eventLabelSize: options.eventLabelSize || 12,
      eventLabelColor: options.eventLabelColor || 'white',

      // Interaction
      interactive: options.interactive !== false,
      showTooltips: options.showTooltips !== false,
      showTimeline: options.showTimeline !== false,

      // Zoom configuration
      enableZoom: options.enableZoom || false,
      zoomLevels: options.zoomLevels || [12, 6, 3, 1],
      zoomControlOffset: options.zoomControlOffset || 40, // Distance from outer radius
      zoomControlSize: options.zoomControlSize || 30,
      zoomControlGap: options.zoomControlGap || 10, // Gap between zoom buttons
      zoomControlColor: options.zoomControlColor || 'gray',
      zoomControlBackground: options.zoomControlBackground || 'white',
      zoomControlFontSize: options.zoomControlFontSize || 20,

      // Events configuration
      eventRadius: options.eventRadius || 15,
      eventStrokeColor: options.eventStrokeColor || 'black',
      eventStrokeWidth: options.eventStrokeWidth || 1,
      eventHoverStrokeColor: options.eventHoverStrokeColor || 'white',
      eventHoverStrokeWidth: options.eventHoverStrokeWidth || 3,

      // Event collision detection
      overlapThresholdRatio: options.overlapThresholdRatio || 2.5, // Multiplier of event radius
      radialOffsetRatio: options.radialOffsetRatio || 1.5, // Multiplier of event radius for separation

      // Event arc configuration
      eventArcOpacity: options.eventArcOpacity || 0.3,

      // Tooltip configuration
      tooltipBackground: options.tooltipBackground || 'white',
      tooltipBorderColor: options.tooltipBorderColor || '#333',
      tooltipBorderWidth: options.tooltipBorderWidth || 2,
      tooltipBorderRadius: options.tooltipBorderRadius || 4,
      tooltipPadding: options.tooltipPadding || 8,
      tooltipFontSize: options.tooltipFontSize || 12,
      tooltipZIndex: options.tooltipZIndex || 1000,
      tooltipOffset: options.tooltipOffset || 10,
      tooltipDateColor: options.tooltipDateColor || '#666',

      // Callbacks
      onEventClick: options.onEventClick || null,
      onEventHover: options.onEventHover || null,
      onZoom: options.onZoom || null
    };

    // Instance properties
    this.container = container;
    this.data = [];
    this.svg = null;
    this.groups = {};
    this.eventElements = [];
    this.currentZoom = 12; // Show all months by default
    this.visibleMonths = [...Array(12).keys()]; // 0-11

    // Calculate dimensions
    this._calculateDimensions();

    // Initialize
    this._init();

    // Set data if provided
    if (data && data.length > 0) {
      this.update(data);
    }
  }

  /**
   * Calculate ring dimensions based on options
   * @private
   */
  _calculateDimensions() {
    const numRings = this.options.rings.length;
    const totalThickness = numRings * this.options.ringThickness;
    const totalGaps = (numRings - 1) * this.options.ringGap;
    const availableSpace = this.options.outerRadius - this.options.innerRadius;

    // Adjust ring thickness if needed to fit
    if (totalThickness + totalGaps > availableSpace) {
      this.options.ringThickness = Math.floor((availableSpace - totalGaps) / numRings);
    }

    // Calculate ring boundaries
    this.ringBoundaries = [];
    let currentRadius = this.options.outerRadius;

    for (let i = 0; i < numRings; i++) {
      const outer = currentRadius;
      const inner = currentRadius - this.options.ringThickness;
      this.ringBoundaries.push({
        outer,
        inner,
        center: (outer + inner) / 2,
        ring: this.options.rings[i],
        color: this.options.colors[i] || '#cccccc'
      });
      currentRadius = inner - this.options.ringGap;
    }

    // Center coordinates (will be set when SVG is created)
    this.cx = this.options.outerRadius + this.options.viewBoxPadding;
    this.cy = this.options.outerRadius + this.options.viewBoxPadding;
    this.viewBoxSize = (this.options.outerRadius + this.options.viewBoxPadding) * 2;
  }

  /**
   * Initialize the visualization
   * @private
   */
  _init() {
    // Clear container
    this.container.innerHTML = '';

    // Create SVG element
    this.svg = this._createSVGElement('svg', {
      'width': '100%',
      'height': '100%',
      'viewBox': `0 0 ${this.viewBoxSize} ${this.viewBoxSize}`,
      'preserveAspectRatio': 'xMidYMid meet'
    });

    // Create main groups
    this.groups = {
      rings: this._createSVGElement('g', { 'class': 'circalify-rings' }),
      lines: this._createSVGElement('g', { 'class': 'circalify-lines' }),
      monthLabels: this._createSVGElement('g', { 'class': 'circalify-month-labels' }),
      ringLabels: this._createSVGElement('g', { 'class': 'circalify-ring-labels' }),
      events: this._createSVGElement('g', { 'class': 'circalify-events' }),
      timeline: this._createSVGElement('g', { 'class': 'circalify-timeline' }),
      controls: this._createSVGElement('g', { 'class': 'circalify-controls' })
    };

    // Append groups in order
    Object.values(this.groups).forEach(group => this.svg.appendChild(group));

    // Append SVG to container
    this.container.appendChild(this.svg);

    // Draw base structure
    this._drawRings();
    this._drawMonthLines();
    this._drawMonthLabels();
    this._drawRingLabels();

    // Draw timeline if enabled
    if (this.options.showTimeline) {
      this._drawTimeline();
    }

    // Add zoom controls if enabled
    if (this.options.enableZoom) {
      this._addZoomControls();
    }

    // Set up event handlers
    if (this.options.interactive) {
      this._setupEventHandlers();
    }
  }

  /**
   * Create an SVG element with namespace
   * @private
   */
  _createSVGElement(type, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    return element;
  }

  /**
   * Draw the concentric rings
   * @private
   */
  _drawRings() {
    // Clear existing rings
    this.groups.rings.innerHTML = '';

    // Draw center circle (innermost area)
    const centerCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.options.innerRadius,
      'fill': this.options.backgroundColor,
      'stroke': this.options.strokeColor,
      'stroke-width': this.options.strokeWidth
    });
    this.groups.rings.appendChild(centerCircle);

    // Draw each ring
    this.ringBoundaries.forEach((ring, index) => {
      const ringPath = this._createDonutPath(ring.inner, ring.outer, this.cx, this.cy);
      const ringElement = this._createSVGElement('path', {
        'd': ringPath,
        'fill': ring.color,
        'stroke': this.options.strokeColor,
        'stroke-width': this.options.strokeWidth,
        'fill-rule': 'evenodd',
        'data-ring': ring.ring
      });
      this.groups.rings.appendChild(ringElement);
    });

    // Draw outer boundary circle
    const outerCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.options.outerRadius,
      'fill': 'none',
      'stroke': this.options.outerBorderColor,
      'stroke-width': this.options.outerBorderWidth
    });
    this.groups.rings.appendChild(outerCircle);
  }

  /**
   * Create SVG path for a donut shape
   * @private
   */
  _createDonutPath(innerRadius, outerRadius, cx, cy) {
    // Outer circle (clockwise)
    const outerPath = [
      `M ${cx + outerRadius} ${cy}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${cx - outerRadius} ${cy}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${cx + outerRadius} ${cy}`,
      'Z'
    ].join(' ');

    // Inner circle (counter-clockwise to create hole)
    const innerPath = [
      `M ${cx + innerRadius} ${cy}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${cx - innerRadius} ${cy}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${cx + innerRadius} ${cy}`,
      'Z'
    ].join(' ');

    return `${outerPath} ${innerPath}`;
  }

  /**
   * Draw month divider lines
   * @private
   */
  _drawMonthLines() {
    this.groups.lines.innerHTML = '';

    const angleStep = (2 * Math.PI) / this.currentZoom;
    const visibleCount = Math.min(this.currentZoom, this.visibleMonths.length);

    for (let i = 0; i < visibleCount; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x1 = this.cx + this.options.innerRadius * Math.cos(angle);
      const y1 = this.cy + this.options.innerRadius * Math.sin(angle);
      const x2 = this.cx + this.options.outerRadius * Math.cos(angle);
      const y2 = this.cy + this.options.outerRadius * Math.sin(angle);

      // Main line (subtle)
      const line = this._createSVGElement('line', {
        'x1': x1,
        'y1': y1,
        'x2': x2,
        'y2': y2,
        'stroke': this.options.lineColor,
        'stroke-width': this.options.lineWidth
      });
      this.groups.lines.appendChild(line);

      // Accent line near center (more visible)
      const accentLength = (this.options.outerRadius - this.options.innerRadius) * this.options.accentLineRatio;
      const accentLine = this._createSVGElement('line', {
        'x1': x2,
        'y1': y2,
        'x2': x2 - accentLength * Math.cos(angle),
        'y2': y2 - accentLength * Math.sin(angle),
        'stroke': this.options.accentLineColor,
        'stroke-width': this.options.accentLineWidth
      });
      this.groups.lines.appendChild(accentLine);
    }
  }

  /**
   * Draw month labels
   * @private
   */
  _drawMonthLabels() {
    if (!this.options.showMonthLabels) return;

    this.groups.monthLabels.innerHTML = '';

    const angleStep = (2 * Math.PI) / this.currentZoom;
    const visibleCount = Math.min(this.currentZoom, this.visibleMonths.length);

    // Position labels just outside the outer radius
    const labelRadius = this.options.outerRadius + this.options.monthLabelOffset;

    for (let i = 0; i < visibleCount; i++) {
      const monthIndex = this.visibleMonths[i];
      const angle = angleStep * i + angleStep / 2 - Math.PI / 2;
      const x = this.cx + labelRadius * Math.cos(angle);
      const y = this.cy + labelRadius * Math.sin(angle);

      const text = this._createSVGElement('text', {
        'x': x,
        'y': y,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-family': this.options.fontFamily,
        'font-size': this.options.monthLabelSize,
        'fill': this.options.monthLabelColor
      });
      text.textContent = this.options.monthLabels[monthIndex];
      this.groups.monthLabels.appendChild(text);
    }
  }

  /**
   * Draw ring labels
   * @private
   */
  _drawRingLabels() {
    if (!this.options.showLabels) return;

    this.groups.ringLabels.innerHTML = '';

    // Draw labels at top and bottom of each ring
    this.ringBoundaries.forEach(ring => {
      // Top label
      const topText = this._createSVGElement('text', {
        'x': this.cx,
        'y': this.cy - ring.center,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-family': this.options.fontFamily,
        'font-size': this.options.ringLabelSize,
        'fill': this.options.ringLabelColor
      });
      topText.textContent = ring.ring;
      this.groups.ringLabels.appendChild(topText);

      // Bottom label
      const bottomText = this._createSVGElement('text', {
        'x': this.cx,
        'y': this.cy + ring.center,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-family': this.options.fontFamily,
        'font-size': this.options.ringLabelSize,
        'fill': this.options.ringLabelColor
      });
      bottomText.textContent = ring.ring;
      this.groups.ringLabels.appendChild(bottomText);
    });
  }

  /**
   * Draw current date timeline
   * @private
   */
  _drawTimeline() {
    this.groups.timeline.innerHTML = '';

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate();

    // Check if current month is visible
    if (!this.visibleMonths.includes(currentMonth)) return;

    const monthIndex = this.visibleMonths.indexOf(currentMonth);
    const angleStep = (2 * Math.PI) / this.currentZoom;
    const monthAngle = angleStep * monthIndex - Math.PI / 2;
    const dayProgress = currentDay / daysInMonth;
    const angle = monthAngle + angleStep * dayProgress;

    // Draw line from inner to outer radius
    const innerX = this.cx + this.options.innerRadius * Math.cos(angle);
    const innerY = this.cy + this.options.innerRadius * Math.sin(angle);
    const outerX = this.cx + this.options.outerRadius * Math.cos(angle);
    const outerY = this.cy + this.options.outerRadius * Math.sin(angle);

    const timeline = this._createSVGElement('line', {
      'x1': innerX,
      'y1': innerY,
      'x2': outerX,
      'y2': outerY,
      'stroke': this.options.timelineColor,
      'stroke-width': this.options.timelineWidth,
      'pointer-events': 'none'
    });

    this.groups.timeline.appendChild(timeline);
  }

  /**
   * Add zoom controls
   * @private
   */
  _addZoomControls() {
    const controlX = this.cx + this.options.outerRadius + this.options.zoomControlOffset;
    const controlY = this.cy - this.options.zoomControlSize - this.options.viewBoxPadding;

    // Zoom in button
    const zoomInGroup = this._createSVGElement('g', {
      'cursor': 'pointer',
      'class': 'circalify-zoom-in'
    });

    const zoomInRect = this._createSVGElement('rect', {
      'x': controlX,
      'y': controlY,
      'width': this.options.zoomControlSize,
      'height': this.options.zoomControlSize,
      'fill': this.options.zoomControlBackground,
      'stroke': this.options.zoomControlColor,
      'stroke-width': this.options.strokeWidth
    });

    const zoomInText = this._createSVGElement('text', {
      'x': controlX + this.options.zoomControlSize / 2,
      'y': controlY + this.options.zoomControlSize * 0.65,
      'text-anchor': 'middle',
      'font-family': this.options.fontFamily,
      'font-size': this.options.zoomControlFontSize,
      'fill': this.options.zoomControlColor
    });
    zoomInText.textContent = '+';

    zoomInGroup.appendChild(zoomInRect);
    zoomInGroup.appendChild(zoomInText);
    zoomInGroup.addEventListener('click', () => this._zoomIn());

    // Zoom out button
    const zoomOutGroup = this._createSVGElement('g', {
      'cursor': 'pointer',
      'class': 'circalify-zoom-out'
    });

    const zoomOutRect = this._createSVGElement('rect', {
      'x': controlX,
      'y': controlY + this.options.zoomControlSize + this.options.zoomControlGap,
      'width': this.options.zoomControlSize,
      'height': this.options.zoomControlSize,
      'fill': this.options.zoomControlBackground,
      'stroke': this.options.zoomControlColor,
      'stroke-width': this.options.strokeWidth
    });

    const zoomOutText = this._createSVGElement('text', {
      'x': controlX + this.options.zoomControlSize / 2,
      'y': controlY + this.options.zoomControlSize + this.options.zoomControlGap + this.options.zoomControlSize * 0.65,
      'text-anchor': 'middle',
      'font-family': this.options.fontFamily,
      'font-size': this.options.zoomControlFontSize,
      'fill': this.options.zoomControlColor
    });
    zoomOutText.textContent = '-';

    zoomOutGroup.appendChild(zoomOutRect);
    zoomOutGroup.appendChild(zoomOutText);
    zoomOutGroup.addEventListener('click', () => this._zoomOut());

    this.groups.controls.appendChild(zoomInGroup);
    this.groups.controls.appendChild(zoomOutGroup);
  }

  /**
   * Zoom in (show fewer months)
   * @private
   */
  _zoomIn() {
    const zoomIndex = this.options.zoomLevels.indexOf(this.currentZoom);
    if (zoomIndex > 0) {
      this.currentZoom = this.options.zoomLevels[zoomIndex - 1];
      this._updateVisibleMonths();
      this._redraw();

      if (this.options.onZoom) {
        this.options.onZoom(this.currentZoom);
      }
    }
  }

  /**
   * Zoom out (show more months)
   * @private
   */
  _zoomOut() {
    const zoomIndex = this.options.zoomLevels.indexOf(this.currentZoom);
    if (zoomIndex < this.options.zoomLevels.length - 1) {
      this.currentZoom = this.options.zoomLevels[zoomIndex + 1];
      this._updateVisibleMonths();
      this._redraw();

      if (this.options.onZoom) {
        this.options.onZoom(this.currentZoom);
      }
    }
  }

  /**
   * Update which months are visible based on zoom level
   * @private
   */
  _updateVisibleMonths() {
    const currentMonth = new Date().getMonth();

    if (this.currentZoom === 12) {
      this.visibleMonths = [...Array(12).keys()];
    } else if (this.currentZoom === 6) {
      // Show 6 months centered on current month
      this.visibleMonths = [];
      for (let i = 0; i < 6; i++) {
        this.visibleMonths.push((currentMonth + i) % 12);
      }
    } else if (this.currentZoom === 3) {
      // Show 3 months centered on current month
      this.visibleMonths = [
        (currentMonth + 11) % 12,
        currentMonth,
        (currentMonth + 1) % 12
      ];
    } else if (this.currentZoom === 1) {
      // Show only current month
      this.visibleMonths = [currentMonth];
    }
  }

  /**
   * Redraw the entire visualization
   * @private
   */
  _redraw() {
    this._drawMonthLines();
    this._drawMonthLabels();
    this._drawTimeline();
    this._renderEvents();
  }

  /**
   * Set up event handlers
   * @private
   */
  _setupEventHandlers() {
    // Scroll zoom if enabled
    if (this.options.enableZoom) {
      this.container.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
          this._zoomIn();
        } else {
          this._zoomOut();
        }
      });
    }
  }

  /**
   * Validate event data
   * @private
   */
  _validateEventData(event) {
    const errors = [];

    if (!event.date) {
      errors.push('Event must have a date');
    } else if (!(event.date instanceof Date) && !Date.parse(event.date)) {
      errors.push('Event date must be a valid Date or date string');
    }

    if (!event.label) {
      errors.push('Event must have a label');
    }

    if (!event.ring) {
      errors.push('Event must specify a ring');
    } else if (!this.options.rings.includes(event.ring)) {
      errors.push(`Ring "${event.ring}" not found in configured rings`);
    }

    return errors;
  }

  /**
   * Render events on the wheel
   * @private
   */
  _renderEvents() {
    // Clear existing events
    this.groups.events.innerHTML = '';
    this.eventElements = [];

    // Group events by ring and month
    const eventsByRing = {};

    this.data.forEach(event => {
      const date = event.date instanceof Date ? event.date : new Date(event.date);
      const month = date.getMonth();

      // Only render if month is visible
      if (!this.visibleMonths.includes(month)) return;

      if (!eventsByRing[event.ring]) {
        eventsByRing[event.ring] = [];
      }

      eventsByRing[event.ring].push({
        ...event,
        date,
        month,
        day: date.getDate(),
        daysInMonth: new Date(date.getFullYear(), month + 1, 0).getDate()
      });
    });

    // Render events for each ring
    Object.entries(eventsByRing).forEach(([ringName, events]) => {
      const ring = this.ringBoundaries.find(r => r.ring === ringName);
      if (!ring) return;

      // Sort events by date
      events.sort((a, b) => a.date - b.date);

      // Apply collision detection
      const adjustedEvents = this._adjustEventPositions(events, ring.center);

      // Render each event
      adjustedEvents.forEach(event => {
        this._renderEvent(event, ring);
      });

      // Draw arc connecting events if more than one
      if (events.length > 1) {
        this._drawEventArc(events, ring);
      }
    });
  }

  /**
   * Adjust event positions to avoid overlaps
   * @private
   */
  _adjustEventPositions(events, ringRadius) {
    const overlapThreshold = this.options.eventRadius * this.options.overlapThresholdRatio;
    const radialOffset = this.options.eventRadius * this.options.radialOffsetRatio;

    events.forEach(event => {
      const monthIndex = this.visibleMonths.indexOf(event.month);
      const angleStep = (2 * Math.PI) / this.currentZoom;
      const monthAngle = angleStep * monthIndex - Math.PI / 2;
      const dayProgress = event.day / event.daysInMonth;
      const angle = monthAngle + angleStep * dayProgress;

      event.angle = angle;
      event.x = this.cx + ringRadius * Math.cos(angle);
      event.y = this.cy + ringRadius * Math.sin(angle);
      event.adjustedX = event.x;
      event.adjustedY = event.y;
    });

    // Group overlapping events
    const groups = [];
    const processed = new Set();

    events.forEach((event, i) => {
      if (processed.has(i)) return;

      const group = [event];
      processed.add(i);

      events.forEach((other, j) => {
        if (i !== j && !processed.has(j)) {
          const distance = Math.sqrt(
            Math.pow(event.x - other.x, 2) +
            Math.pow(event.y - other.y, 2)
          );

          if (distance < overlapThreshold) {
            group.push(other);
            processed.add(j);
          }
        }
      });

      groups.push(group);
    });

    // Adjust positions for overlapping groups
    groups.forEach(group => {
      if (group.length > 1) {
        group.forEach((event, index) => {
          const radiusOffset = (index - (group.length - 1) / 2) * (radialOffset / 2);
          const newRadius = ringRadius + radiusOffset;

          event.adjustedX = this.cx + newRadius * Math.cos(event.angle);
          event.adjustedY = this.cy + newRadius * Math.sin(event.angle);
          event.isAdjusted = true;
        });
      }
    });

    return events;
  }

  /**
   * Render a single event
   * @private
   */
  _renderEvent(event, ring) {
    const group = this._createSVGElement('g', {
      'class': 'circalify-event',
      'data-event-id': event.id || Math.random().toString(36).substr(2, 9)
    });

    // Event circle
    const circle = this._createSVGElement('circle', {
      'cx': event.adjustedX,
      'cy': event.adjustedY,
      'r': this.options.eventRadius,
      'fill': event.color || ring.color,
      'stroke': this.options.eventStrokeColor,
      'stroke-width': this.options.eventStrokeWidth,
      'cursor': this.options.interactive ? 'pointer' : 'default'
    });

    // Event label (day number)
    const text = this._createSVGElement('text', {
      'x': event.adjustedX,
      'y': event.adjustedY,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-family': this.options.fontFamily,
      'font-size': this.options.eventLabelSize,
      'fill': this.options.eventLabelColor,
      'pointer-events': 'none'
    });
    text.textContent = event.day;

    group.appendChild(circle);
    group.appendChild(text);

    // Add interactivity
    if (this.options.interactive) {
      // Hover effect
      group.addEventListener('mouseenter', (e) => {
        circle.setAttribute('stroke', this.options.eventHoverStrokeColor);
        circle.setAttribute('stroke-width', this.options.eventHoverStrokeWidth);

        if (this.options.showTooltips) {
          this._showTooltip(e, event);
        }

        if (this.options.onEventHover) {
          this.options.onEventHover(event, e);
        }
      });

      group.addEventListener('mouseleave', () => {
        circle.setAttribute('stroke', this.options.eventStrokeColor);
        circle.setAttribute('stroke-width', this.options.eventStrokeWidth);

        if (this.options.showTooltips) {
          this._hideTooltip();
        }
      });

      // Click handler
      group.addEventListener('click', (e) => {
        if (this.options.onEventClick) {
          this.options.onEventClick(event, e);
        }
      });
    }

    this.groups.events.appendChild(group);
    this.eventElements.push({ element: group, data: event });
  }

  /**
   * Draw arc connecting events in a ring
   * @private
   */
  _drawEventArc(events, ring) {
    if (events.length < 2) return;

    const first = events[0];
    const last = events[events.length - 1];

    const startAngle = first.angle;
    const endAngle = last.angle;
    let sweepAngle = endAngle - startAngle;

    // Adjust for crossing year boundary
    if (sweepAngle < 0) sweepAngle += 2 * Math.PI;

    const largeArcFlag = sweepAngle > Math.PI ? 1 : 0;

    const startX = this.cx + ring.center * Math.cos(startAngle);
    const startY = this.cy + ring.center * Math.sin(startAngle);
    const endX = this.cx + ring.center * Math.cos(endAngle);
    const endY = this.cy + ring.center * Math.sin(endAngle);

    const arcPath = [
      `M ${startX} ${startY}`,
      `A ${ring.center} ${ring.center} 0 ${largeArcFlag} 1 ${endX} ${endY}`
    ].join(' ');

    const arc = this._createSVGElement('path', {
      'd': arcPath,
      'fill': 'none',
      'stroke': events[0].color || ring.color,
      'stroke-width': this.options.ringThickness,
      'opacity': this.options.eventArcOpacity,
      'pointer-events': 'none'
    });

    this.groups.events.insertBefore(arc, this.groups.events.firstChild);
  }

  /**
   * Show tooltip for an event
   * @private
   */
  _showTooltip(e, event) {
    // Remove existing tooltip
    this._hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'circalify-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: ${this.options.tooltipBackground};
      border: ${this.options.tooltipBorderWidth}px solid ${this.options.tooltipBorderColor};
      border-radius: ${this.options.tooltipBorderRadius}px;
      padding: ${this.options.tooltipPadding}px;
      font-family: ${this.options.fontFamily};
      font-size: ${this.options.tooltipFontSize}px;
      z-index: ${this.options.tooltipZIndex};
      pointer-events: none;
    `;

    const dateStr = event.date.toLocaleDateString();
    tooltip.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${dateStr}</div>
      <div style="font-size: ${this.options.tooltipFontSize + 2}px; margin-bottom: 4px;">${event.label}</div>
      ${event.description ? `<div style="color: ${this.options.tooltipDateColor};">${event.description}</div>` : ''}
    `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = this.container.getBoundingClientRect();
    const x = rect.left + e.clientX - rect.left;
    const y = rect.top + e.clientY - rect.top;

    tooltip.style.left = `${x + this.options.tooltipOffset}px`;
    tooltip.style.top = `${y - tooltip.offsetHeight - this.options.tooltipOffset}px`;

    this._currentTooltip = tooltip;
  }

  /**
   * Hide tooltip
   * @private
   */
  _hideTooltip() {
    if (this._currentTooltip) {
      this._currentTooltip.remove();
      this._currentTooltip = null;
    }
  }

  /**
   * Update the visualization with new data
   * @public
   */
  update(data) {
    if (!Array.isArray(data)) {
      throw new Error('Circalify: Data must be an array');
    }

    // Validate all events
    const allErrors = [];
    data.forEach((event, index) => {
      const errors = this._validateEventData(event);
      if (errors.length > 0) {
        allErrors.push(`Event ${index}: ${errors.join(', ')}`);
      }
    });

    if (allErrors.length > 0) {
      console.error('Circalify: Data validation errors:', allErrors);
      return;
    }

    // Update data
    this.data = data;

    // Re-render events
    this._renderEvents();
  }

  /**
   * Destroy the visualization and clean up
   * @public
   */
  destroy() {
    // Remove event listeners
    if (this.container) {
      this.container.removeEventListener('wheel', this._handleWheel);
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear references
    this.svg = null;
    this.groups = {};
    this.eventElements = [];
    this.data = [];
    this._currentTooltip = null;
  }

  /**
   * Get current zoom level
   * @public
   */
  getZoomLevel() {
    return this.currentZoom;
  }

  /**
   * Set zoom level
   * @public
   */
  setZoomLevel(months) {
    if (this.options.zoomLevels.includes(months)) {
      this.currentZoom = months;
      this._updateVisibleMonths();
      this._redraw();
    }
  }

  /**
   * Export visualization as SVG string
   * @public
   */
  exportSVG() {
    if (!this.svg) return null;

    const serializer = new XMLSerializer();
    return serializer.serializeToString(this.svg);
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Circalify;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return Circalify;
  });
} else {
  window.Circalify = Circalify;
}