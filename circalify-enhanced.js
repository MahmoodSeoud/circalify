/**
 * Circalify Enhanced - PlanDisc-style circular annual wheel visualization
 * With day-based segments and curved event arcs
 * @license MIT
 */

class Circalify {
  constructor(container, data = [], options = {}) {
    // Validate container
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('CircalifyEnhanced: Valid HTML container element required');
    }

    // Default options optimized for PlanDisc style
    this.options = {
      // Ring configuration
      rings: options.rings || ['Outer', 'Middle', 'Inner'],
      ringThickness: options.ringThickness || 60,
      ringGap: options.ringGap || 1, // Minimal gap - just thin white line

      // Size configuration
      innerRadius: options.innerRadius || 70,
      outerRadius: options.outerRadius || 320,
      viewBoxPadding: options.viewBoxPadding || 80,

      // PlanDisc exact colors
      colors: options.colors || ['#b8e6e6', '#ffd4d4', '#d4e8e0', '#f0dcd4'],
      backgroundColor: options.backgroundColor || '#f5f7fa',
      centerColor: options.centerColor || '#ffffff',
      strokeColor: options.strokeColor || 'rgba(255, 255, 255, 0.8)',
      strokeWidth: options.strokeWidth || 1,

      // Enhanced styling
      enableShadows: options.enableShadows !== false,
      shadowColor: options.shadowColor || 'rgba(0, 0, 0, 0.15)',
      shadowBlur: options.shadowBlur || 10,

      // Segment styling
      segmentPadding: options.segmentPadding || 2,
      segmentCornerRadius: options.segmentCornerRadius || 4,
      segmentHoverScale: options.segmentHoverScale || 1.05,

      // Animation configuration
      enableAnimations: options.enableAnimations !== false,
      animationDuration: options.animationDuration || 300,
      animationEasing: options.animationEasing || 'cubic-bezier(0.4, 0, 0.2, 1)',

      // Line appearance
      lineColor: options.lineColor || 'rgba(220, 220, 220, 0.3)',
      lineWidth: options.lineWidth || 1,

      // Timeline appearance
      timelineColor: options.timelineColor || '#e74c3c',
      timelineWidth: options.timelineWidth || 2,
      timelineGlow: options.timelineGlow !== false,

      // Labels configuration
      showLabels: options.showLabels !== false,
      showMonthLabels: options.showMonthLabels !== false,
      monthLabels: options.monthLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      showWeekNumbers: options.showWeekNumbers !== false,
      weekNumberSize: options.weekNumberSize || 8,
      weekNumberColor: options.weekNumberColor || '#999',
      weekNumberOpacity: options.weekNumberOpacity || 0.5,

      // Ring thicknesses and spacing (auto-calculated offsets)
      weekRingThickness: options.weekRingThickness || 12,
      monthRingThickness: options.monthRingThickness || 16,
      labelRingGap: options.labelRingGap || 8, // Gap between label rings

      // Font configuration (enhanced)
      fontFamily: options.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      monthLabelSize: options.monthLabelSize || 13,
      monthLabelColor: options.monthLabelColor || '#5a6c7d',
      monthLabelWeight: options.monthLabelWeight || '500',

      // Segment card configuration
      segmentLabelSize: options.segmentLabelSize || 11,
      segmentLabelMinSize: options.segmentLabelMinSize || 7,
      segmentLabelColor: options.segmentLabelColor || 'white',
      segmentLabelWeight: options.segmentLabelWeight || '600',
      segmentDateSize: options.segmentDateSize || 9,
      segmentDateColor: options.segmentDateColor || 'rgba(255, 255, 255, 0.8)',

      // Curved text configuration
      useCurvedText: options.useCurvedText !== false,
      curvedTextCharSpacing: options.curvedTextCharSpacing || 0.5,

      // Interaction
      interactive: options.interactive !== false,
      showTooltips: options.showTooltips !== false,
      showTimeline: options.showTimeline !== false,
      enableDetailPanel: options.enableDetailPanel !== false,

      // Filter sidebar configuration
      showFilterSidebar: options.showFilterSidebar || false,
      sidebarWidth: options.sidebarWidth || 250,

      // Zoom configuration (enhanced)
      enableZoom: options.enableZoom !== false,
      zoomLevels: options.zoomLevels || [12, 6, 3, 1],
      smoothZoom: options.smoothZoom !== false,

      // Callbacks
      onSegmentClick: options.onSegmentClick || null,
      onSegmentHover: options.onSegmentHover || null,
      onZoom: options.onZoom || null,
      onFilterChange: options.onFilterChange || null
    };

    // Instance properties
    this.container = container;
    this.data = [];
    this.svg = null;
    this.defs = null;
    this.groups = {};
    this.segments = [];
    this.currentZoom = 12;
    this.visibleMonths = [...Array(12).keys()];
    this.activeFilters = new Set();
    this.detailPanel = null;
    this.filterSidebar = null;

    // Animation state
    this.animationFrame = null;
    this.transitions = new Map();

    // Calculate dimensions
    this._calculateDimensions();

    // Initialize
    this._init();

    // Apply data if provided
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

    // Buffer ring configuration
    const bufferRingThickness = 15; // Thin ring for labels

    // Each ring now has: data ring + buffer ring
    const totalDataThickness = numRings * this.options.ringThickness;
    const totalBufferThickness = numRings * bufferRingThickness;
    const totalGaps = (numRings - 1) * this.options.ringGap;
    const availableSpace = this.options.outerRadius - this.options.innerRadius;

    // Adjust ring thickness if needed
    const totalNeeded = totalDataThickness + totalBufferThickness + totalGaps;
    if (totalNeeded > availableSpace) {
      this.options.ringThickness = Math.floor((availableSpace - totalBufferThickness - totalGaps) / numRings);
    }

    // Calculate ring boundaries with buffer rings
    this.ringBoundaries = [];
    this.bufferRingBoundaries = [];
    let currentRadius = this.options.outerRadius;

    for (let i = 0; i < numRings; i++) {
      // Data ring
      const dataOuter = currentRadius;
      const dataInner = currentRadius - this.options.ringThickness;
      const colorConfig = this.options.colors[i % this.options.colors.length];

      this.ringBoundaries.push({
        outer: dataOuter,
        inner: dataInner,
        center: (dataOuter + dataInner) / 2,
        ring: this.options.rings[i],
        color: typeof colorConfig === 'string' ? colorConfig : colorConfig.start,
        gradient: typeof colorConfig === 'object' ? colorConfig : null
      });

      // Move to buffer ring position
      currentRadius = dataInner;

      // Buffer ring (for labels)
      const bufferOuter = currentRadius;
      const bufferInner = currentRadius - bufferRingThickness;

      this.bufferRingBoundaries.push({
        outer: bufferOuter,
        inner: bufferInner,
        center: (bufferOuter + bufferInner) / 2,
        ring: this.options.rings[i],
        index: i
      });

      // Move to next ring position (with gap)
      currentRadius = bufferInner - this.options.ringGap;
    }

    // Center coordinates
    this.cx = this.options.outerRadius + this.options.viewBoxPadding;
    this.cy = this.options.outerRadius + this.options.viewBoxPadding;
    this.viewBoxSize = (this.options.outerRadius + this.options.viewBoxPadding) * 2;
  }

  /**
   * Initialize the enhanced visualization
   * @private
   */
  _init() {
    // Clear container and set up wrapper
    this.container.innerHTML = '';
    this.container.style.position = 'relative';

    // Create main wrapper
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      position: relative;
      background: #f5f7fa;
    `;

    // Add header (like PlanDisc)
    this._createHeader(wrapper);

    // Create content wrapper for SVG and sidebar
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
      display: flex;
      flex: 1;
      width: 100%;
      position: relative;
      min-height: 0;
      overflow: hidden;
    `;

    // Create SVG container
    const svgContainer = document.createElement('div');
    svgContainer.style.cssText = `
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      min-height: 0;
    `;

    // Create SVG element
    this.svg = this._createSVGElement('svg', {
      'width': '100%',
      'height': '100%',
      'viewBox': `0 0 ${this.viewBoxSize} ${this.viewBoxSize}`,
      'preserveAspectRatio': 'xMidYMid meet',
      'style': 'max-width: 100%; max-height: 100%;'
    });

    // Add definitions for gradients and filters
    this._createDefs();

    // Create main groups
    this.groups = {
      background: this._createSVGElement('g', { 'class': 'circalify-background' }),
      rings: this._createSVGElement('g', { 'class': 'circalify-rings' }),
      segments: this._createSVGElement('g', { 'class': 'circalify-segments' }),
      lines: this._createSVGElement('g', { 'class': 'circalify-lines' }),
      weekNumbers: this._createSVGElement('g', { 'class': 'circalify-week-numbers' }),
      monthLabels: this._createSVGElement('g', { 'class': 'circalify-month-labels' }),
      centerInfo: this._createSVGElement('g', { 'class': 'circalify-center-info' }),
      timeline: this._createSVGElement('g', { 'class': 'circalify-timeline' }),
      controls: this._createSVGElement('g', { 'class': 'circalify-controls' }),
      overlay: this._createSVGElement('g', { 'class': 'circalify-overlay' })
    };

    // Append groups in order
    Object.values(this.groups).forEach(group => this.svg.appendChild(group));

    // Append SVG to container
    svgContainer.appendChild(this.svg);
    contentWrapper.appendChild(svgContainer);

    // Add filter sidebar if enabled
    if (this.options.showFilterSidebar) {
      this._createFilterSidebar(contentWrapper);
    }

    // Add detail panel container
    if (this.options.enableDetailPanel) {
      this._createDetailPanel(contentWrapper);
    }

    wrapper.appendChild(contentWrapper);
    this.container.appendChild(wrapper);

    // Draw base structure
    this._drawBackground();
    this._drawRings();
    this._drawMonthLines();

    // Draw week numbers if enabled
    if (this.options.showWeekNumbers) {
      this._drawWeekNumbers();
    }

    this._drawMonthLabels();

    // Draw timeline if enabled
    if (this.options.showTimeline) {
      this._drawTimeline();
      this._startTimelineAnimation();
    }

    // Add zoom controls
    if (this.options.enableZoom) {
      this._addZoomControls();
    }

    // Set up event handlers
    if (this.options.interactive) {
      this._setupEventHandlers();
    }

    // Apply CSS animations
    this._injectStyles();
  }

  /**
   * Create header bar (PlanDisc style)
   * @private
   */
  _createHeader(wrapper) {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 30px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      font-family: ${this.options.fontFamily};
      min-height: 60px;
    `;

    // Left side: Toggle buttons
    const leftSection = document.createElement('div');
    leftSection.style.cssText = `
      display: flex;
      gap: 10px;
    `;

    const calendarBtn = this._createHeaderButton('Kalender', true);
    const planningBtn = this._createHeaderButton('Planlægigen', false);

    leftSection.appendChild(calendarBtn);
    leftSection.appendChild(planningBtn);

    // Center: Date range display
    const centerSection = document.createElement('div');
    centerSection.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    `;

    const currentYear = new Date().getFullYear();
    centerSection.innerHTML = `
      <span style="cursor: pointer; padding: 5px 10px;">&lt;&lt;</span>
      <span style="cursor: pointer; padding: 5px 10px;">&lt;</span>
      <span style="padding: 0 15px;">Jan ${currentYear} - Dec ${currentYear}</span>
      <span style="cursor: pointer; padding: 5px 10px;">&gt;</span>
      <span style="cursor: pointer; padding: 5px 10px;">&gt;&gt;</span>
    `;

    // Right side: Could add more controls here
    const rightSection = document.createElement('div');
    rightSection.style.cssText = `
      display: flex;
      gap: 10px;
    `;

    header.appendChild(leftSection);
    header.appendChild(centerSection);
    header.appendChild(rightSection);

    wrapper.appendChild(header);
  }

  /**
   * Create header button
   * @private
   */
  _createHeaderButton(label, active = false) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = `
      padding: 8px 16px;
      border: 1px solid ${active ? '#5090d3' : '#ddd'};
      background: ${active ? '#5090d3' : 'white'};
      color: ${active ? 'white' : '#666'};
      border-radius: 4px;
      cursor: pointer;
      font-family: ${this.options.fontFamily};
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      if (!active) {
        button.style.borderColor = '#5090d3';
        button.style.color = '#5090d3';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (!active) {
        button.style.borderColor = '#ddd';
        button.style.color = '#666';
      }
    });

    return button;
  }

  /**
   * Create SVG definitions for gradients and filters
   * @private
   */
  _createDefs() {
    this.defs = this._createSVGElement('defs');

    // Create gradients for each ring
    this.ringBoundaries.forEach((ring, index) => {
      if (ring.gradient && this.options.useGradients) {
        const gradient = this._createSVGElement('linearGradient', {
          'id': `ring-gradient-${index}`,
          'x1': '0%',
          'y1': '0%',
          'x2': '100%',
          'y2': '100%'
        });

        const stop1 = this._createSVGElement('stop', {
          'offset': '0%',
          'style': `stop-color:${ring.gradient.start};stop-opacity:1`
        });

        const stop2 = this._createSVGElement('stop', {
          'offset': '100%',
          'style': `stop-color:${ring.gradient.end};stop-opacity:1`
        });

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        this.defs.appendChild(gradient);
      }
    });

    // Create shadow filter
    if (this.options.enableShadows) {
      const shadowFilter = this._createSVGElement('filter', {
        'id': 'shadow-filter',
        'x': '-50%',
        'y': '-50%',
        'width': '200%',
        'height': '200%'
      });

      const feGaussianBlur = this._createSVGElement('feGaussianBlur', {
        'in': 'SourceAlpha',
        'stdDeviation': '3'
      });

      const feOffset = this._createSVGElement('feOffset', {
        'dx': '0',
        'dy': '2',
        'result': 'offsetblur'
      });

      const feFlood = this._createSVGElement('feFlood', {
        'flood-color': this.options.shadowColor,
        'flood-opacity': '0.3'
      });

      const feComposite = this._createSVGElement('feComposite', {
        'in2': 'offsetblur',
        'operator': 'in'
      });

      const feMerge = this._createSVGElement('feMerge');
      const feMergeNode1 = this._createSVGElement('feMergeNode');
      const feMergeNode2 = this._createSVGElement('feMergeNode', {
        'in': 'SourceGraphic'
      });

      feMerge.appendChild(feMergeNode1);
      feMerge.appendChild(feMergeNode2);

      shadowFilter.appendChild(feGaussianBlur);
      shadowFilter.appendChild(feOffset);
      shadowFilter.appendChild(feFlood);
      shadowFilter.appendChild(feComposite);
      shadowFilter.appendChild(feMerge);

      this.defs.appendChild(shadowFilter);
    }

    // Create glow filter for timeline
    if (this.options.timelineGlow) {
      const glowFilter = this._createSVGElement('filter', {
        'id': 'glow-filter'
      });

      const feGaussianBlur = this._createSVGElement('feGaussianBlur', {
        'stdDeviation': '2',
        'result': 'coloredBlur'
      });

      const feMerge = this._createSVGElement('feMerge');
      const feMergeNode1 = this._createSVGElement('feMergeNode', {
        'in': 'coloredBlur'
      });
      const feMergeNode2 = this._createSVGElement('feMergeNode', {
        'in': 'SourceGraphic'
      });

      feMerge.appendChild(feMergeNode1);
      feMerge.appendChild(feMergeNode2);
      glowFilter.appendChild(feGaussianBlur);
      glowFilter.appendChild(feMerge);

      this.defs.appendChild(glowFilter);
    }

    this.svg.appendChild(this.defs);
  }

  /**
   * Draw background circle
   * @private
   */
  _drawBackground() {
    // Clear existing
    this.groups.background.innerHTML = '';

    // Add subtle background gradient
    const bgGradient = this._createSVGElement('radialGradient', {
      'id': 'bg-gradient'
    });

    const stop1 = this._createSVGElement('stop', {
      'offset': '0%',
      'style': `stop-color:${this.options.centerColor};stop-opacity:1`
    });

    const stop2 = this._createSVGElement('stop', {
      'offset': '100%',
      'style': `stop-color:${this.options.backgroundColor};stop-opacity:1`
    });

    bgGradient.appendChild(stop1);
    bgGradient.appendChild(stop2);
    this.defs.appendChild(bgGradient);

    // Background circle
    const bgCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.options.outerRadius + 20,
      'fill': 'url(#bg-gradient)',
      'opacity': '0.3'
    });

    this.groups.background.appendChild(bgCircle);
  }

  /**
   * Draw the base rings with PlanDisc styling
   * @private
   */
  _drawRings() {
    // Clear existing rings
    this.groups.rings.innerHTML = '';

    // Draw center circle
    const centerCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.options.innerRadius,
      'fill': this.options.backgroundColor,
      'stroke': '#e5e7eb',
      'stroke-width': '1'
    });
    this.groups.rings.appendChild(centerCircle);

    // Add year divider line at top (December 31 / January 1 boundary)
    // This line goes from inner radius to outer radius, through ALL rings
    const dividerAngle = -Math.PI / 2; // Top of circle (12 o'clock position)
    const dividerInnerX = this.cx + this.options.innerRadius * Math.cos(dividerAngle);
    const dividerInnerY = this.cy + this.options.innerRadius * Math.sin(dividerAngle);
    const dividerOuterX = this.cx + this.options.outerRadius * Math.cos(dividerAngle);
    const dividerOuterY = this.cy + this.options.outerRadius * Math.sin(dividerAngle);

    const yearDivider = this._createSVGElement('line', {
      'x1': dividerInnerX,
      'y1': dividerInnerY,
      'x2': dividerOuterX,
      'y2': dividerOuterY,
      'stroke': '#d0d0d0',
      'stroke-width': '3',
      'opacity': '0.8',
      'stroke-linecap': 'round'
    });
    this.groups.rings.appendChild(yearDivider);

    // Draw each data ring and buffer ring
    this.ringBoundaries.forEach((ring, index) => {
      // Draw data ring
      const ringPath = this._createDonutPath(ring.inner, ring.outer);
      const ringElement = this._createSVGElement('path', {
        'd': ringPath,
        'fill': ring.color,
        'stroke': 'rgba(255, 255, 255, 0.8)',
        'stroke-width': '1',
        'opacity': '0.6'
      });
      this.groups.rings.appendChild(ringElement);

      // Draw buffer ring (white/light ring for labels)
      const bufferRing = this.bufferRingBoundaries[index];
      const bufferPath = this._createDonutPath(bufferRing.inner, bufferRing.outer);
      const bufferElement = this._createSVGElement('path', {
        'd': bufferPath,
        'fill': '#ffffff',
        'stroke': 'rgba(220, 220, 220, 0.5)',
        'stroke-width': '1',
        'opacity': '0.9'
      });
      this.groups.rings.appendChild(bufferElement);

      // Add curved ring label on the buffer ring
      this._addRingLabelOnBufferRing(bufferRing, index);
    });

    // Draw day segments for each ring
    this._drawDaySegments();

    // Outer border
    const outerCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.options.outerRadius,
      'fill': 'none',
      'stroke': '#e5e7eb',
      'stroke-width': '1'
    });
    this.groups.rings.appendChild(outerCircle);
  }

  /**
   * Add ring labels wrapping around the buffer ring (PlanDisc style)
   * @private
   */
  _addRingLabelOnBufferRing(bufferRing, index) {
    const ringLabel = bufferRing.ring;
    const labelRadius = bufferRing.center;

    // Determine number of labels based on ring size
    // Larger (outer) rings get more labels for better coverage
    const isOuterRing = index === 0; // First ring is outermost
    const numLabels = isOuterRing ? 5 : 4;

    // Create curved text paths evenly distributed around the buffer ring
    const angleStep = (2 * Math.PI) / numLabels;
    const quarterPositions = [];

    for (let i = 0; i < numLabels; i++) {
      quarterPositions.push({
        centerAngle: (angleStep * i) - Math.PI / 2, // Start at top (12 o'clock)
        arcSpan: Math.PI / 3
      });
    }

    quarterPositions.forEach((quarter, quarterIndex) => {
      // The centerAngle starts at -π/2 (top), so we need to adjust for actual position
      // Convert to standard angle where 0° is at 3 o'clock (right side)
      // quarter.centerAngle of -π/2 is actually at top (12 o'clock)
      // We need to convert this to determine which half of circle we're on

      // Add π/2 to shift coordinate system so 0° is at top
      let adjustedAngle = quarter.centerAngle + Math.PI / 2;

      // Normalize to 0 to 2π range
      while (adjustedAngle < 0) adjustedAngle += 2 * Math.PI;
      while (adjustedAngle >= 2 * Math.PI) adjustedAngle -= 2 * Math.PI;

      // Flip text on left half to keep it readable (right-side up)
      // When text flows from right-to-left (left side of circle), it appears upside down
      // Left half is when adjustedAngle is between π/2 and 3π/2 (90° to 270° from top)
      const shouldFlip = adjustedAngle > Math.PI / 2 && adjustedAngle < 3 * Math.PI / 2;

      let startAngle, endAngle;
      if (shouldFlip) {
        // Reverse the path direction for left half
        startAngle = quarter.centerAngle + quarter.arcSpan / 2;
        endAngle = quarter.centerAngle - quarter.arcSpan / 2;
      } else {
        // Normal path direction for right half
        startAngle = quarter.centerAngle - quarter.arcSpan / 2;
        endAngle = quarter.centerAngle + quarter.arcSpan / 2;
      }

      const textPathId = `buffer-label-${index}-q${quarterIndex}`;
      const startX = this.cx + labelRadius * Math.cos(startAngle);
      const startY = this.cy + labelRadius * Math.sin(startAngle);
      const endX = this.cx + labelRadius * Math.cos(endAngle);
      const endY = this.cy + labelRadius * Math.sin(endAngle);

      // Create arc path for text
      const largeArc = quarter.arcSpan > Math.PI ? 1 : 0;
      // When flipped, we need to reverse the sweep direction too
      const sweepFlag = shouldFlip ? 0 : 1;
      const pathD = `M ${startX} ${startY} A ${labelRadius} ${labelRadius} 0 ${largeArc} ${sweepFlag} ${endX} ${endY}`;

      // Add path to defs
      const path = this._createSVGElement('path', {
        'id': textPathId,
        'd': pathD,
        'fill': 'none'
      });
      this.defs.appendChild(path);

      // Create curved text element on buffer ring
      const text = this._createSVGElement('text', {
        'font-family': this.options.fontFamily,
        'font-size': '10',
        'font-weight': '600',
        'fill': '#666',
        'opacity': '0.85',
        'letter-spacing': '0.5',
        'dominant-baseline': 'middle'
      });

      const textPath = this._createSVGElement('textPath', {
        'href': `#${textPathId}`,
        'startOffset': '50%',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
      });
      textPath.textContent = ringLabel;

      text.appendChild(textPath);
      this.groups.rings.appendChild(text);
    });
  }

  /**
   * Draw day segments (365 clickable segments)
   * @private
   */
  _drawDaySegments() {
    const daysInYear = 365;
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let dayOfYear = 0;

    for (let month = 0; month < 12; month++) {
      const daysInMonth = monthDays[month];

      for (let day = 0; day < daysInMonth; day++) {
        dayOfYear++;

        // Draw segment for each ring
        this.ringBoundaries.forEach((ring) => {
          const startAngle = (dayOfYear - 1) / daysInYear * 2 * Math.PI - Math.PI / 2;
          const endAngle = dayOfYear / daysInYear * 2 * Math.PI - Math.PI / 2;

          const segment = this._createArcSegment(
            ring.inner,
            ring.outer,
            startAngle,
            endAngle
          );

          const path = this._createSVGElement('path', {
            'd': segment,
            'fill': 'transparent',
            'stroke': 'rgba(255, 255, 255, 0.3)',
            'stroke-width': '0.5',
            'class': 'day-segment',
            'data-day': dayOfYear,
            'data-month': month + 1,
            'data-ring': ring.ring,
            'cursor': 'pointer'
          });

          // Add hover effect
          if (this.options.interactive) {
            path.addEventListener('mouseenter', (e) => {
              if (!path.hasAttribute('data-has-event')) {
                path.setAttribute('fill', 'rgba(0, 0, 0, 0.05)');
              }
              if (this.options.onSegmentHover) {
                this.options.onSegmentHover({
                  day: dayOfYear,
                  month: month + 1,
                  ring: ring.ring
                }, e);
              }
            });

            path.addEventListener('mouseleave', () => {
              if (!path.hasAttribute('data-has-event')) {
                path.setAttribute('fill', 'transparent');
              }
            });

            path.addEventListener('click', (e) => {
              if (this.options.onSegmentClick) {
                this.options.onSegmentClick({
                  day: dayOfYear,
                  month: month + 1,
                  ring: ring.ring
                }, e);
              }
            });
          }

          this.groups.rings.appendChild(path);
        });
      }
    }
  }

  /**
   * Create arc segment path
   * @private
   */
  _createArcSegment(innerRadius, outerRadius, startAngle, endAngle) {
    const innerStartX = this.cx + innerRadius * Math.cos(startAngle);
    const innerStartY = this.cy + innerRadius * Math.sin(startAngle);
    const innerEndX = this.cx + innerRadius * Math.cos(endAngle);
    const innerEndY = this.cy + innerRadius * Math.sin(endAngle);

    const outerStartX = this.cx + outerRadius * Math.cos(startAngle);
    const outerStartY = this.cy + outerRadius * Math.sin(startAngle);
    const outerEndX = this.cx + outerRadius * Math.cos(endAngle);
    const outerEndY = this.cy + outerRadius * Math.sin(endAngle);

    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;

    return [
      `M ${innerStartX} ${innerStartY}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEndX} ${innerEndY}`,
      `L ${outerEndX} ${outerEndY}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerStartX} ${outerStartY}`,
      'Z'
    ].join(' ');
  }

  /**
   * Create donut path
   * @private
   */
  _createDonutPath(innerRadius, outerRadius) {
    const cx = this.cx;
    const cy = this.cy;

    return [
      `M ${cx + outerRadius} ${cy}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${cx - outerRadius} ${cy}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${cx + outerRadius} ${cy}`,
      'Z',
      `M ${cx + innerRadius} ${cy}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${cx - innerRadius} ${cy}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${cx + innerRadius} ${cy}`,
      'Z'
    ].join(' ');
  }

  /**
   * Create path for a segment with padding
   * @private
   */
  _createSegmentPath(innerRadius, outerRadius, startAngle, endAngle, padding = 0) {
    // Calculate padding in radians
    const totalAngle = endAngle - startAngle;
    const paddingAngle = padding / outerRadius;

    const actualStartAngle = startAngle + paddingAngle;
    const actualEndAngle = endAngle - paddingAngle;

    const x1 = this.cx + innerRadius * Math.cos(actualStartAngle);
    const y1 = this.cy + innerRadius * Math.sin(actualStartAngle);
    const x2 = this.cx + outerRadius * Math.cos(actualStartAngle);
    const y2 = this.cy + outerRadius * Math.sin(actualStartAngle);
    const x3 = this.cx + outerRadius * Math.cos(actualEndAngle);
    const y3 = this.cy + outerRadius * Math.sin(actualEndAngle);
    const x4 = this.cx + innerRadius * Math.cos(actualEndAngle);
    const y4 = this.cy + innerRadius * Math.sin(actualEndAngle);

    const largeArcFlag = totalAngle > Math.PI ? 1 : 0;

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
      Z
    `;
  }

  /**
   * Draw month divider lines with enhanced styling
   * @private
   */
  _drawMonthLines() {
    this.groups.lines.innerHTML = '';

    const angleStep = (2 * Math.PI) / 12;

    for (let i = 0; i < 12; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x1 = this.cx + this.options.innerRadius * Math.cos(angle);
      const y1 = this.cy + this.options.innerRadius * Math.sin(angle);
      const x2 = this.cx + this.options.outerRadius * Math.cos(angle);
      const y2 = this.cy + this.options.outerRadius * Math.sin(angle);

      // Subtle line
      const line = this._createSVGElement('line', {
        'x1': x1,
        'y1': y1,
        'x2': x2,
        'y2': y2,
        'stroke': this.options.lineColor,
        'stroke-width': this.options.lineWidth,
        'opacity': '0.3'
      });
      this.groups.lines.appendChild(line);
    }
  }

  /**
   * Draw week numbers around the outer edge (52 weeks)
   * @private
   */
  _drawWeekNumbers() {
    this.groups.weekNumbers.innerHTML = '';

    // Draw week numbers (1-52) on a curved ring
    const weekRingThickness = 12;
    const numberRadius = this.options.outerRadius + this.options.weekNumberOffset;
    const totalWeeks = 52;

    // Draw background ring band for week numbers (donut style)
    const weekRingInner = numberRadius - weekRingThickness / 2;
    const weekRingOuter = numberRadius + weekRingThickness / 2;
    const weekRingPath = this._createDonutPath(weekRingInner, weekRingOuter);
    const weekRing = this._createSVGElement('path', {
      'd': weekRingPath,
      'fill': '#ffffff',
      'stroke': 'rgba(220, 220, 220, 0.5)',
      'stroke-width': '1',
      'opacity': '0.9'
    });
    this.groups.weekNumbers.appendChild(weekRing);

    for (let i = 1; i <= totalWeeks; i++) {
      // Calculate angle range for this week number
      const centerAngle = ((i - 0.5) / totalWeeks) * 2 * Math.PI - Math.PI / 2;
      const arcSpan = (1 / totalWeeks) * 2 * Math.PI * 0.8; // 80% of available space

      // Determine if we need to flip the text
      let adjustedAngle = centerAngle + Math.PI / 2;
      while (adjustedAngle < 0) adjustedAngle += 2 * Math.PI;
      while (adjustedAngle >= 2 * Math.PI) adjustedAngle -= 2 * Math.PI;
      const shouldFlip = adjustedAngle > Math.PI / 2 && adjustedAngle < 3 * Math.PI / 2;

      let startAngle, endAngle;
      if (shouldFlip) {
        startAngle = centerAngle + arcSpan / 2;
        endAngle = centerAngle - arcSpan / 2;
      } else {
        startAngle = centerAngle - arcSpan / 2;
        endAngle = centerAngle + arcSpan / 2;
      }

      const textPathId = `week-label-${i}`;
      const startX = this.cx + numberRadius * Math.cos(startAngle);
      const startY = this.cy + numberRadius * Math.sin(startAngle);
      const endX = this.cx + numberRadius * Math.cos(endAngle);
      const endY = this.cy + numberRadius * Math.sin(endAngle);

      // Create arc path for text
      const largeArc = arcSpan > Math.PI ? 1 : 0;
      const sweepFlag = shouldFlip ? 0 : 1;
      const pathD = `M ${startX} ${startY} A ${numberRadius} ${numberRadius} 0 ${largeArc} ${sweepFlag} ${endX} ${endY}`;

      // Add path to defs
      const path = this._createSVGElement('path', {
        'id': textPathId,
        'd': pathD,
        'fill': 'none'
      });
      this.defs.appendChild(path);

      // Create curved text element
      const text = this._createSVGElement('text', {
        'font-family': this.options.fontFamily,
        'font-size': this.options.weekNumberSize,
        'fill': this.options.weekNumberColor,
        'opacity': this.options.weekNumberOpacity
      });

      const textPath = this._createSVGElement('textPath', {
        'href': `#${textPathId}`,
        'startOffset': '50%',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
      });
      textPath.textContent = i;

      text.appendChild(textPath);
      this.groups.weekNumbers.appendChild(text);
    }
  }

  /**
   * Draw enhanced month labels
   * @private
   */
  _drawMonthLabels() {
    if (!this.options.showMonthLabels) return;

    this.groups.monthLabels.innerHTML = '';

    const angleStep = (2 * Math.PI) / 12;
    const monthRingThickness = 16;
    const labelRadius = this.options.outerRadius + this.options.monthLabelOffset;

    // Draw background ring band for month labels (donut style)
    const monthRingInner = labelRadius - monthRingThickness / 2;
    const monthRingOuter = labelRadius + monthRingThickness / 2;
    const monthRingPath = this._createDonutPath(monthRingInner, monthRingOuter);
    const monthRing = this._createSVGElement('path', {
      'd': monthRingPath,
      'fill': '#ffffff',
      'stroke': 'rgba(220, 220, 220, 0.5)',
      'stroke-width': '1',
      'opacity': '0.9'
    });
    this.groups.monthLabels.appendChild(monthRing);

    for (let i = 0; i < 12; i++) {
      // Calculate angle range for this month
      const centerAngle = angleStep * i + angleStep / 2 - Math.PI / 2;
      const arcSpan = angleStep * 0.6; // 60% of the month's arc for the label

      // Determine if we need to flip the text
      let adjustedAngle = centerAngle + Math.PI / 2;
      while (adjustedAngle < 0) adjustedAngle += 2 * Math.PI;
      while (adjustedAngle >= 2 * Math.PI) adjustedAngle -= 2 * Math.PI;
      const shouldFlip = adjustedAngle > Math.PI / 2 && adjustedAngle < 3 * Math.PI / 2;

      let startAngle, endAngle;
      if (shouldFlip) {
        startAngle = centerAngle + arcSpan / 2;
        endAngle = centerAngle - arcSpan / 2;
      } else {
        startAngle = centerAngle - arcSpan / 2;
        endAngle = centerAngle + arcSpan / 2;
      }

      const textPathId = `month-label-${i}`;
      const startX = this.cx + labelRadius * Math.cos(startAngle);
      const startY = this.cy + labelRadius * Math.sin(startAngle);
      const endX = this.cx + labelRadius * Math.cos(endAngle);
      const endY = this.cy + labelRadius * Math.sin(endAngle);

      // Create arc path for text
      const largeArc = arcSpan > Math.PI ? 1 : 0;
      const sweepFlag = shouldFlip ? 0 : 1;
      const pathD = `M ${startX} ${startY} A ${labelRadius} ${labelRadius} 0 ${largeArc} ${sweepFlag} ${endX} ${endY}`;

      // Add path to defs
      const path = this._createSVGElement('path', {
        'id': textPathId,
        'd': pathD,
        'fill': 'none'
      });
      this.defs.appendChild(path);

      // Create curved text element
      const text = this._createSVGElement('text', {
        'font-family': this.options.fontFamily,
        'font-size': this.options.monthLabelSize,
        'font-weight': this.options.monthLabelWeight,
        'fill': this.options.monthLabelColor,
        'class': 'month-label',
        'opacity': '0',
        'style': `animation: fadeIn ${this.options.animationDuration}ms ${this.options.animationEasing} forwards; animation-delay: ${i * 50}ms;`
      });

      const textPath = this._createSVGElement('textPath', {
        'href': `#${textPathId}`,
        'startOffset': '50%',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
      });
      textPath.textContent = this.options.monthLabels[i];

      text.appendChild(textPath);
      this.groups.monthLabels.appendChild(text);
    }
  }

  /**
   * Draw current date timeline with enhanced effects
   * @private
   */
  _drawTimeline() {
    this.groups.timeline.innerHTML = '';

    const now = new Date();

    // Calculate day of year (1-365)
    const dayOfYear = this._getDayOfYear(now);

    // Calculate angle based on day of year (365 divisions, not 12 months)
    const daysInYear = 365;
    const angle = (dayOfYear / daysInYear) * 2 * Math.PI - Math.PI / 2;

    // Draw line from inner to outer radius
    const innerX = this.cx + (this.options.innerRadius - 10) * Math.cos(angle);
    const innerY = this.cy + (this.options.innerRadius - 10) * Math.sin(angle);
    const outerX = this.cx + (this.options.outerRadius + 10) * Math.cos(angle);
    const outerY = this.cy + (this.options.outerRadius + 10) * Math.sin(angle);

    const timeline = this._createSVGElement('line', {
      'x1': innerX,
      'y1': innerY,
      'x2': outerX,
      'y2': outerY,
      'stroke': this.options.timelineColor,
      'stroke-width': this.options.timelineWidth,
      'pointer-events': 'none',
      'filter': this.options.timelineGlow ? 'url(#glow-filter)' : 'none',
      'class': 'timeline-indicator'
    });

    this.groups.timeline.appendChild(timeline);
  }

  /**
   * Start timeline animation
   * @private
   */
  _startTimelineAnimation() {
    if (!this.options.showTimeline) return;

    // Update timeline position every minute
    setInterval(() => {
      this._drawTimeline();
    }, 60000);
  }

  /**
   * Add enhanced zoom controls
   * @private
   */
  _addZoomControls() {
    const controlsGroup = this._createSVGElement('g', {
      'class': 'zoom-controls',
      'transform': `translate(${this.viewBoxSize - 60}, ${this.viewBoxSize - 120})`
    });

    // Background for controls
    const bg = this._createSVGElement('rect', {
      'x': 0,
      'y': 0,
      'width': 40,
      'height': 90,
      'rx': 20,
      'ry': 20,
      'fill': 'white',
      'filter': 'url(#shadow-filter)',
      'opacity': '0.9'
    });
    controlsGroup.appendChild(bg);

    // Zoom in button
    const zoomInGroup = this._createSVGElement('g', {
      'cursor': 'pointer',
      'class': 'zoom-in-btn',
      'transform': 'translate(20, 25)'
    });

    const zoomInCircle = this._createSVGElement('circle', {
      'cx': 0,
      'cy': 0,
      'r': 15,
      'fill': 'transparent'
    });

    const zoomInText = this._createSVGElement('text', {
      'x': 0,
      'y': 5,
      'text-anchor': 'middle',
      'font-family': this.options.fontFamily,
      'font-size': '20',
      'font-weight': 'bold',
      'fill': '#5a6c7d'
    });
    zoomInText.textContent = '+';

    zoomInGroup.appendChild(zoomInCircle);
    zoomInGroup.appendChild(zoomInText);
    zoomInGroup.addEventListener('click', () => this._zoomIn());

    // Zoom out button
    const zoomOutGroup = this._createSVGElement('g', {
      'cursor': 'pointer',
      'class': 'zoom-out-btn',
      'transform': 'translate(20, 65)'
    });

    const zoomOutCircle = this._createSVGElement('circle', {
      'cx': 0,
      'cy': 0,
      'r': 15,
      'fill': 'transparent'
    });

    const zoomOutText = this._createSVGElement('text', {
      'x': 0,
      'y': 5,
      'text-anchor': 'middle',
      'font-family': this.options.fontFamily,
      'font-size': '20',
      'font-weight': 'bold',
      'fill': '#5a6c7d'
    });
    zoomOutText.textContent = '−';

    zoomOutGroup.appendChild(zoomOutCircle);
    zoomOutGroup.appendChild(zoomOutText);
    zoomOutGroup.addEventListener('click', () => this._zoomOut());

    // Add zoom level indicator
    const zoomLevel = this._createSVGElement('text', {
      'x': 20,
      'y': 48,
      'text-anchor': 'middle',
      'font-family': this.options.fontFamily,
      'font-size': '10',
      'fill': '#95a5a6',
      'class': 'zoom-level'
    });
    zoomLevel.textContent = '100%';

    controlsGroup.appendChild(zoomInGroup);
    controlsGroup.appendChild(zoomLevel);
    controlsGroup.appendChild(zoomOutGroup);

    this.groups.controls.appendChild(controlsGroup);
  }

  /**
   * Create filter sidebar
   * @private
   */
  _createFilterSidebar(wrapper) {
    this.filterSidebar = document.createElement('div');
    this.filterSidebar.style.cssText = `
      width: ${this.options.sidebarWidth}px;
      background: white;
      border-left: 1px solid #e0e0e0;
      padding: 20px;
      overflow-y: auto;
      font-family: ${this.options.fontFamily};
    `;

    // Title
    const title = document.createElement('h3');
    title.textContent = 'Filters';
    title.style.cssText = `
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    `;
    this.filterSidebar.appendChild(title);

    // Ring filters
    const ringSection = document.createElement('div');
    ringSection.style.marginBottom = '20px';

    const ringTitle = document.createElement('h4');
    ringTitle.textContent = 'Rings';
    ringTitle.style.cssText = `
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    `;
    ringSection.appendChild(ringTitle);

    this.options.rings.forEach((ring, index) => {
      const label = document.createElement('label');
      label.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        cursor: pointer;
      `;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.value = ring;
      checkbox.style.marginRight = '8px';
      checkbox.addEventListener('change', () => this._handleFilterChange());

      const text = document.createElement('span');
      text.textContent = ring;
      text.style.fontSize = '14px';

      const colorDot = document.createElement('span');
      const colorConfig = this.options.colors[index % this.options.colors.length];
      colorDot.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${typeof colorConfig === 'string' ? colorConfig : colorConfig.start};
        margin-left: auto;
      `;

      label.appendChild(checkbox);
      label.appendChild(text);
      label.appendChild(colorDot);
      ringSection.appendChild(label);
    });

    this.filterSidebar.appendChild(ringSection);
    wrapper.appendChild(this.filterSidebar);
  }

  /**
   * Create detail panel for segments
   * @private
   */
  _createDetailPanel(wrapper) {
    this.detailPanel = document.createElement('div');
    this.detailPanel.style.cssText = `
      position: absolute;
      right: ${this.options.showFilterSidebar ? this.options.sidebarWidth + 20 : 20}px;
      top: 50%;
      transform: translateY(-50%) translateX(20px);
      width: 320px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 24px;
      font-family: ${this.options.fontFamily};
      display: none;
      opacity: 0;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      right: 12px;
      top: 12px;
      background: #f5f5f5;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#e0e0e0';
      closeBtn.style.color = '#333';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = '#f5f5f5';
      closeBtn.style.color = '#666';
    });
    closeBtn.addEventListener('click', () => this._hideDetailPanel());

    this.detailPanel.appendChild(closeBtn);
    wrapper.appendChild(this.detailPanel);
  }

  /**
   * Show detail panel with segment information
   * @private
   */
  _showDetailPanel(segmentData) {
    if (!this.detailPanel || !this.options.enableDetailPanel) return;

    // Clear previous content (except close button)
    const closeBtn = this.detailPanel.querySelector('button');
    this.detailPanel.innerHTML = '';
    this.detailPanel.appendChild(closeBtn);

    // Add content
    const title = document.createElement('h3');
    title.textContent = segmentData.label;
    title.style.cssText = `
      margin: 0 0 15px 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    `;

    // Handle different date formats
    let dateText = '';
    if (segmentData.startDate && segmentData.endDate) {
      const startDate = new Date(segmentData.startDate);
      const endDate = new Date(segmentData.endDate);

      if (startDate.getTime() === endDate.getTime()) {
        dateText = startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        dateText = `${startDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })} - ${endDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}`;
      }
    } else if (segmentData.date) {
      const singleDate = segmentData.date instanceof Date ? segmentData.date : new Date(segmentData.date);
      dateText = singleDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    const date = document.createElement('p');
    date.textContent = dateText;
    date.style.cssText = `
      margin: 0 0 15px 0;
      color: #666;
      font-size: 14px;
    `;

    const ring = document.createElement('p');
    ring.innerHTML = `<strong>Category:</strong> ${segmentData.ring}`;
    ring.style.cssText = `
      margin: 0 0 10px 0;
      color: #555;
      font-size: 14px;
    `;

    if (segmentData.description) {
      const desc = document.createElement('p');
      desc.textContent = segmentData.description;
      desc.style.cssText = `
        margin: 0 0 15px 0;
        color: #555;
        font-size: 14px;
        line-height: 1.5;
      `;
      this.detailPanel.appendChild(desc);
    }

    this.detailPanel.appendChild(title);
    this.detailPanel.appendChild(date);
    this.detailPanel.appendChild(ring);

    // Show panel with smooth animation
    this.detailPanel.style.display = 'block';
    // Trigger reflow to ensure transition works
    this.detailPanel.offsetHeight;
    requestAnimationFrame(() => {
      this.detailPanel.style.opacity = '1';
      this.detailPanel.style.transform = 'translateY(-50%) translateX(0)';
    });
  }

  /**
   * Hide detail panel
   * @private
   */
  _hideDetailPanel() {
    if (!this.detailPanel) return;

    this.detailPanel.style.opacity = '0';
    this.detailPanel.style.transform = 'translateY(-50%) translateX(20px)';

    setTimeout(() => {
      this.detailPanel.style.display = 'none';
    }, 300);
  }

  /**
   * Handle filter changes
   * @private
   */
  _handleFilterChange() {
    const checkboxes = this.filterSidebar.querySelectorAll('input[type="checkbox"]');
    this.activeFilters.clear();

    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        this.activeFilters.add(checkbox.value);
      }
    });

    this._renderSegments();

    if (this.options.onFilterChange) {
      this.options.onFilterChange(Array.from(this.activeFilters));
    }
  }

  /**
   * Inject CSS styles for animations
   * @private
   */
  _injectStyles() {
    if (document.getElementById('circalify-enhanced-styles')) return;

    const style = document.createElement('style');
    style.id = 'circalify-enhanced-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
      }

      .timeline-pulse {
        animation: pulse 2s infinite;
      }

      .ring-segment:hover {
        opacity: 1 !important;
        filter: brightness(1.1);
      }

      .zoom-in-btn:hover circle,
      .zoom-out-btn:hover circle {
        fill: rgba(90, 108, 125, 0.1);
      }

      .segment-card {
        cursor: pointer;
        transition: all ${this.options.animationDuration}ms ${this.options.animationEasing};
      }

      .segment-card:hover {
        transform: scale(${this.options.segmentHoverScale});
        filter: brightness(1.1);
      }

      /* Smooth scrollbar for detail panel */
      .circalify-detail-panel::-webkit-scrollbar {
        width: 8px;
      }

      .circalify-detail-panel::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 10px;
      }

      .circalify-detail-panel::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
        transition: background 0.2s;
      }

      .circalify-detail-panel::-webkit-scrollbar-thumb:hover {
        background: #999;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Render events as curved arc segments
   * @private
   */
  _renderSegments() {
    // Clear existing segments
    this.groups.segments.innerHTML = '';
    this.segments = [];

    // Filter and group data
    const filteredData = this.activeFilters.size > 0
      ? this.data.filter(item => this.activeFilters.has(item.ring))
      : this.data;

    // Group by ring
    const segmentsByRing = {};
    filteredData.forEach(segment => {
      if (!segmentsByRing[segment.ring]) {
        segmentsByRing[segment.ring] = [];
      }
      segmentsByRing[segment.ring].push(segment);
    });

    // Render events for each ring
    Object.entries(segmentsByRing).forEach(([ringName, segments]) => {
      const ring = this.ringBoundaries.find(r => r.ring === ringName);
      if (!ring) return;

      segments.forEach(segment => {
        this._renderEventArc(segment, ring);
      });
    });
  }

  /**
   * Render event as curved arc segment
   * @private
   */
  _renderEventArc(eventData, ring) {
    // Parse event dates
    const startDate = new Date(eventData.startDate || eventData.date);
    const endDate = new Date(eventData.endDate || eventData.date);

    // Calculate day of year
    const startDay = this._getDayOfYear(startDate);
    const endDay = this._getDayOfYear(endDate);

    // Calculate angles
    const daysInYear = 365;
    const startAngle = (startDay - 1) / daysInYear * 2 * Math.PI - Math.PI / 2;
    const endAngle = endDay / daysInYear * 2 * Math.PI - Math.PI / 2;

    // Create arc path
    const arcPath = this._createArcSegment(ring.inner, ring.outer, startAngle, endAngle);

    const eventId = eventData.id || Math.random().toString(36).substr(2, 9);
    const eventGroup = this._createSVGElement('g', {
      'class': 'event-arc',
      'data-event-id': eventId
    });

    // Event arc
    const arc = this._createSVGElement('path', {
      'd': arcPath,
      'fill': eventData.color || '#5090d3',
      'stroke': 'rgba(255, 255, 255, 0.8)',
      'stroke-width': '1',
      'opacity': '0.85',
      'cursor': 'pointer'
    });

    eventGroup.appendChild(arc);

    // Add label - choose between radial or curved based on segment dimensions
    const label = eventData.label || '';
    const midAngle = (startAngle + endAngle) / 2;
    const textRadius = (ring.inner + ring.outer) / 2;

    // Calculate segment dimensions
    const ringHeight = ring.outer - ring.inner;
    const arcLength = Math.abs(endAngle - startAngle) * textRadius;

    // Decide orientation based on aspect ratio
    // Use tangential text for wide segments (arcLength > ringHeight)
    // Use radial text for tall/narrow segments (arcLength < ringHeight)
    const useTangentialText = arcLength > ringHeight;
    const useRadialText = !useTangentialText;

    const maxFontSize = this.options.segmentLabelSize;
    const minFontSize = this.options.segmentLabelMinSize;

    if (useRadialText) {
      // RADIAL TEXT (pointing outward from center along the radius)
      const textX = this.cx + textRadius * Math.cos(midAngle);
      const textY = this.cy + textRadius * Math.sin(midAngle);

      // Rotation angle in degrees - along the radius direction (pointing outward)
      let rotationAngle = (midAngle * 180 / Math.PI);

      // Keep text upright - flip if upside down
      if (rotationAngle > 90 && rotationAngle < 270) {
        rotationAngle += 180;
      }

      // Font size based on ring height (text height constraint)
      let fontSize = Math.min(maxFontSize, Math.max(minFontSize, ringHeight * 0.3));

      // Truncate based on ARC LENGTH since text runs along the tangent
      // Account for actual pixel width of text
      const charWidth = fontSize * 0.6; // Approximate character width
      const maxChars = Math.floor(arcLength / charWidth);
      let displayLabel = label;

      if (label.length > maxChars && maxChars >= 2) {
        displayLabel = label.substring(0, Math.max(2, maxChars - 2)) + '..';
      }

      // Only show if there's enough space
      if (arcLength > fontSize * 1.5 && maxChars >= 2) {
        const text = this._createSVGElement('text', {
          'x': textX,
          'y': textY,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          'font-family': this.options.fontFamily,
          'font-size': fontSize,
          'font-weight': this.options.segmentLabelWeight,
          'fill': this.options.segmentLabelColor,
          'pointer-events': 'none',
          'transform': `rotate(${rotationAngle}, ${textX}, ${textY})`,
          'style': 'text-shadow: 0 1px 2px rgba(0,0,0,0.3);'
        });
        text.textContent = displayLabel;
        eventGroup.appendChild(text);
      }
    } else {
      // CURVED TEXT (follows the arc)
      // Normalize angle to -π to π range for flip detection
      let normalizedAngle = midAngle;
      while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
      while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;

      // Flip text on bottom half to keep it upright and readable
      // Bottom half: angles from 0 to π (right side going down to left side at bottom)
      // Keep normal for top half: angles from -π to 0 (left side going up to right side at top)
      const shouldFlipText = normalizedAngle > 0;

      const textPathId = `event-text-path-${eventData.id || Math.random().toString(36).substr(2, 9)}`;

      // Create arc path - reverse direction if on left side
      let textArcPath;
      if (shouldFlipText) {
        textArcPath = this._createCurvedTextPath(textRadius, endAngle, startAngle, true);
      } else {
        textArcPath = this._createCurvedTextPath(textRadius, startAngle, endAngle, false);
      }

      // Get or create defs
      let defs = this.svg.querySelector('defs');
      if (!defs) {
        defs = this._createSVGElement('defs');
        this.svg.insertBefore(defs, this.svg.firstChild);
      }

      const path = this._createSVGElement('path', {
        'id': textPathId,
        'd': textArcPath,
        'fill': 'none'
      });
      defs.appendChild(path);

      // Font size based on ring thickness
      let fontSize = Math.min(maxFontSize, Math.max(minFontSize, ringHeight * 0.3));

      // Truncate based on arc length
      const estimatedCharWidth = fontSize * 0.6;
      const maxChars = Math.floor(arcLength / estimatedCharWidth);
      let displayLabel = label;
      if (label.length > maxChars && maxChars >= 3) {
        displayLabel = label.substring(0, Math.max(3, maxChars - 2)) + '..';
      }

      if (maxChars >= 3) {
        const text = this._createSVGElement('text', {
          'font-family': this.options.fontFamily,
          'font-size': fontSize,
          'font-weight': this.options.segmentLabelWeight,
          'fill': this.options.segmentLabelColor,
          'pointer-events': 'none',
          'style': 'text-shadow: 0 1px 2px rgba(0,0,0,0.3);'
        });

        const textPath = this._createSVGElement('textPath', {
          'href': `#${textPathId}`,
          'startOffset': '50%',
          'text-anchor': 'middle'
        });
        textPath.textContent = displayLabel;

        text.appendChild(textPath);
        eventGroup.appendChild(text);
      }
    }

    // Add interactivity
    if (this.options.interactive) {
      eventGroup.addEventListener('mouseenter', () => {
        arc.setAttribute('opacity', '1');
        arc.setAttribute('stroke-width', '2');

        // Show event info in center
        this._showCenterInfo(eventData);

        if (this.options.showTooltips) {
          this._showTooltip(eventData);
        }
      });

      eventGroup.addEventListener('mouseleave', () => {
        arc.setAttribute('opacity', '0.85');
        arc.setAttribute('stroke-width', '1');

        // Clear center info
        this._clearCenterInfo();

        this._hideTooltip();
      });

      eventGroup.addEventListener('click', () => {
        this._showDetailPanel(eventData);
        if (this.options.onSegmentClick) {
          this.options.onSegmentClick(eventData);
        }
      });
    }

    this.groups.segments.appendChild(eventGroup);

    // Mark day segments as having events
    for (let day = startDay; day <= endDay; day++) {
      const segments = this.groups.rings.querySelectorAll(
        `[data-day="${day}"][data-ring="${ring.ring}"]`
      );
      segments.forEach(seg => {
        seg.setAttribute('data-has-event', 'true');
      });
    }

    this.segments.push({ element: eventGroup, data: eventData });
  }

  /**
   * Get day of year from date
   * @private
   */
  _getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    return day;
  }

  /**
   * Create curved text path for event labels
   * @private
   */
  _createCurvedTextPath(radius, startAngle, endAngle, reverse = false) {
    const startX = this.cx + radius * Math.cos(startAngle);
    const startY = this.cy + radius * Math.sin(startAngle);
    const endX = this.cx + radius * Math.cos(endAngle);
    const endY = this.cy + radius * Math.sin(endAngle);

    // Calculate the angular span
    let angleDiff = Math.abs(endAngle - startAngle);

    // Normalize to 0-2π range
    while (angleDiff > 2 * Math.PI) angleDiff -= 2 * Math.PI;

    // Large arc flag: 1 if arc is > 180 degrees
    const largeArc = angleDiff > Math.PI ? 1 : 0;

    // Sweep flag determines direction:
    // 1 = clockwise (positive angle direction)
    // 0 = counter-clockwise (negative angle direction  // When reversed (start > end), we need counter-clockwise to go the short way
    const sweepFlag = reverse ? 0 : 1;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${endX} ${endY}`;
  }

  /**
   * Format date as DD-MM-YYYY (PlanDisc format)
   * @private
   */
  _formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Show event info in center on hover (like PlanDisc)
   * @private
   */
  _showCenterInfo(eventData) {
    this.groups.centerInfo.innerHTML = '';

    // Event label
    const label = this._createSVGElement('text', {
      'x': this.cx,
      'y': this.cy - 15,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-family': this.options.fontFamily,
      'font-size': '18',
      'font-weight': '600',
      'fill': '#333'
    });
    label.textContent = eventData.label;

    // Date range in DD-MM-YYYY format
    const startDate = new Date(eventData.startDate || eventData.date);
    const endDate = new Date(eventData.endDate || eventData.date);

    let dateText = '';
    if (startDate.getTime() === endDate.getTime()) {
      dateText = this._formatDate(startDate);
    } else {
      dateText = `${this._formatDate(startDate)} - ${this._formatDate(endDate)}`;
    }

    const date = this._createSVGElement('text', {
      'x': this.cx,
      'y': this.cy + 5,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-family': this.options.fontFamily,
      'font-size': '14',
      'fill': '#666'
    });
    date.textContent = dateText;

    this.groups.centerInfo.appendChild(label);
    this.groups.centerInfo.appendChild(date);
  }

  /**
   * Clear center info display
   * @private
   */
  _clearCenterInfo() {
    this.groups.centerInfo.innerHTML = '';
  }

  /**
   * Show tooltip for event
   * @private
   */
  _showTooltip(event) {
    this._hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'circalify-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 10px;
      font-family: ${this.options.fontFamily};
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    const startDate = new Date(event.startDate || event.date);
    const endDate = new Date(event.endDate || event.date);

    tooltip.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${event.label}</div>
      <div style="color: #666; font-size: 11px;">
        ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
      </div>
      ${event.description ? `<div style="margin-top: 4px;">${event.description}</div>` : ''}
    `;

    document.body.appendChild(tooltip);
    this._currentTooltip = tooltip;

    // Position tooltip
    const rect = this.container.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
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
   * Setup enhanced event handlers
   * @private
   */
  _setupEventHandlers() {
    // Smooth scroll zoom
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

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target !== document.body) return;

      switch (e.key) {
        case '+':
        case '=':
          this._zoomIn();
          break;
        case '-':
        case '_':
          this._zoomOut();
          break;
        case 'Escape':
          this._hideDetailPanel();
          break;
      }
    });
  }

  /**
   * Zoom in with smooth animation
   * @private
   */
  _zoomIn() {
    const zoomIndex = this.options.zoomLevels.indexOf(this.currentZoom);
    if (zoomIndex > 0) {
      this.currentZoom = this.options.zoomLevels[zoomIndex - 1];
      this._updateZoomLevel();

      if (this.options.onZoom) {
        this.options.onZoom(this.currentZoom);
      }
    }
  }

  /**
   * Zoom out with smooth animation
   * @private
   */
  _zoomOut() {
    const zoomIndex = this.options.zoomLevels.indexOf(this.currentZoom);
    if (zoomIndex < this.options.zoomLevels.length - 1) {
      this.currentZoom = this.options.zoomLevels[zoomIndex + 1];
      this._updateZoomLevel();

      if (this.options.onZoom) {
        this.options.onZoom(this.currentZoom);
      }
    }
  }

  /**
   * Update zoom level display
   * @private
   */
  _updateZoomLevel() {
    const zoomPercent = Math.round((12 / this.currentZoom) * 100);
    const zoomLevelText = this.svg.querySelector('.zoom-level');
    if (zoomLevelText) {
      zoomLevelText.textContent = `${zoomPercent}%`;
    }

    // TODO: Implement actual zoom functionality
    // This would involve recalculating positions and redrawing elements
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
   * Update the visualization with new data
   * @public
   */
  update(data) {
    if (!Array.isArray(data)) {
      throw new Error('CircalifyEnhanced: Data must be an array');
    }

    this.data = data;

    // Initialize active filters with all rings if not set
    if (this.activeFilters.size === 0) {
      this.options.rings.forEach(ring => this.activeFilters.add(ring));
    }

    this._renderSegments();
  }

  /**
   * Destroy the visualization and clean up
   * @public
   */
  destroy() {
    // Remove event listeners
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear references
    this.svg = null;
    this.groups = {};
    this.segments = [];
    this.data = [];
    this.detailPanel = null;
    this.filterSidebar = null;

    // Remove injected styles
    const styles = document.getElementById('circalify-enhanced-styles');
    if (styles) {
      styles.remove();
    }
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
