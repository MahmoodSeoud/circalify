/**
 * CircalifyCore - Main orchestrator for flexible ring-based annual wheel
 * @license MIT
 */

class CircalifyCore {
  constructor(container, config = {}) {
    // Validate container
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('CircalifyCore: Valid HTML container element required');
    }

    this.container = container;

    // Parse and validate configuration
    this.configParser = new ConfigParser();
    this.parsedConfig = this.configParser.parse(config);
    this.generalConfig = this.parsedConfig.general;
    this.ringConfigs = this.parsedConfig.rings;

    // Instance properties
    this.svg = null;
    this.defs = null;
    this.svgGroups = {};
    this.rings = [];
    this.detailPanel = null;
    this.monthSidebar = null;
    this.allEvents = [];
    this.activeMonthButton = null;  // Track which month button is currently active

    // Calculate dimensions
    this._calculateDimensions();

    // Initialize
    this._init();
  }

  /**
   * Calculate dimensions based on configuration
   * @private
   */
  _calculateDimensions() {
    // Calculate center coordinates
    const centerData = LayoutCalculator.calculateCenter(
      this.generalConfig.outerRadius,
      this.generalConfig.viewBoxPadding
    );

    this.cx = centerData.cx;
    this.cy = centerData.cy;
    this.viewBoxSize = centerData.viewBoxSize;

    // Calculate ring boundaries
    this.ringBoundaries = LayoutCalculator.calculateRingBoundaries(
      this.ringConfigs,
      this.generalConfig.innerRadius,
      this.generalConfig.outerRadius,
      this.generalConfig.sameRingHeight
    );
  }

  /**
   * Initialize the visualization
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
      background: ${this.generalConfig.backgroundColor};
    `;

    // Add header
    this._createHeader(wrapper);

    // Create content wrapper
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
    this.svgGroups = {
      background: this._createSVGElement('g', { 'class': 'circalify-background' }),
      rings: this._createSVGElement('g', { 'class': 'circalify-rings' }),
      monthHoverAreas: this._createSVGElement('g', { 'class': 'circalify-month-hover-areas' }),
      segments: this._createSVGElement('g', { 'class': 'circalify-segments' }),
      centerInfo: this._createSVGElement('g', { 'class': 'circalify-center-info' }),
      timeline: this._createSVGElement('g', { 'class': 'circalify-timeline' }),
      controls: this._createSVGElement('g', { 'class': 'circalify-controls' }),
      overlay: this._createSVGElement('g', { 'class': 'circalify-overlay' })
    };

    // Append groups in order
    Object.values(this.svgGroups).forEach(group => this.svg.appendChild(group));

    // Append SVG to container
    svgContainer.appendChild(this.svg);
    contentWrapper.appendChild(svgContainer);

    // Add detail panel if enabled
    if (this.generalConfig.enableDetailPanel) {
      this._createDetailPanel(contentWrapper);
    }

    // Create month sidebar (always available)
    this._createMonthSidebar(contentWrapper);

    wrapper.appendChild(contentWrapper);
    this.container.appendChild(wrapper);

    // Draw base structure
    this._drawBackground();
    this._drawCenterCircle();

    // Create and render rings using factory
    this._createRings();

    // Draw timeline if enabled
    if (this.generalConfig.showTimeline) {
      this._drawTimeline();
      this._startTimelineAnimation();
    }

    // Add zoom controls if enabled
    if (this.generalConfig.enableZoom) {
      this._addZoomControls();
    }

    // Apply CSS animations
    this._injectStyles();
  }

  /**
   * Create header bar
   * @private
   */
  _createHeader(wrapper) {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px 30px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      font-family: ${this.generalConfig.fontFamily};
      min-height: 60px;
    `;

    // Center: Title and date range
    const centerSection = document.createElement('div');
    centerSection.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    `;

    const startYear = this.generalConfig.startYear;
    const startMonth = this.generalConfig.startMonth;
    const endMonth = (startMonth + this.generalConfig.numberOfMonths - 1) % 12;
    const endYear = startYear + Math.floor((startMonth + this.generalConfig.numberOfMonths - 1) / 12);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    centerSection.innerHTML = `
      <span style="padding: 0 15px;">${this.generalConfig.title}</span>
      <span style="color: #666; font-size: 14px;">
        ${monthNames[startMonth]} ${startYear} - ${monthNames[endMonth]} ${endYear}
      </span>
    `;

    header.appendChild(centerSection);
    wrapper.appendChild(header);
  }

  /**
   * Create SVG definitions
   * @private
   */
  _createDefs() {
    this.defs = this._createSVGElement('defs');

    // Create shadow filter
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
      'flood-color': 'rgba(0, 0, 0, 0.3)',
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

    // Create glow filter for timeline
    const glowFilter = this._createSVGElement('filter', {
      'id': 'glow-filter'
    });

    const glowBlur = this._createSVGElement('feGaussianBlur', {
      'stdDeviation': '2',
      'result': 'coloredBlur'
    });

    const glowMerge = this._createSVGElement('feMerge');
    const glowMergeNode1 = this._createSVGElement('feMergeNode', {
      'in': 'coloredBlur'
    });
    const glowMergeNode2 = this._createSVGElement('feMergeNode', {
      'in': 'SourceGraphic'
    });

    glowMerge.appendChild(glowMergeNode1);
    glowMerge.appendChild(glowMergeNode2);
    glowFilter.appendChild(glowBlur);
    glowFilter.appendChild(glowMerge);

    this.defs.appendChild(glowFilter);

    this.svg.appendChild(this.defs);
  }

  /**
   * Draw background
   * @private
   */
  _drawBackground() {
    this.svgGroups.background.innerHTML = '';

    const bgCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.generalConfig.outerRadius + 20,
      'fill': this.generalConfig.backgroundColor,
      'opacity': '0.3'
    });

    this.svgGroups.background.appendChild(bgCircle);
  }

  /**
   * Draw center circle
   * @private
   */
  _drawCenterCircle() {
    const centerCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.generalConfig.innerRadius,
      'fill': this.generalConfig.backgroundColor,
      'stroke': '#e5e7eb',
      'stroke-width': '1'
    });
    this.svgGroups.rings.appendChild(centerCircle);

    // Outer border
    const outerCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.generalConfig.outerRadius,
      'fill': 'none',
      'stroke': '#e5e7eb',
      'stroke-width': '1'
    });
    this.svgGroups.rings.appendChild(outerCircle);
  }

  /**
   * Create rings using factory pattern
   * @private
   */
  _createRings() {
    // Create context object to pass to rings
    const context = {
      cx: this.cx,
      cy: this.cy,
      svgGroups: this.svgGroups,
      generalConfig: this.generalConfig,
      defs: this.defs,
      callbacks: {
        onSegmentClick: this._handleSegmentClick.bind(this),
        onSegmentHover: this._handleSegmentHover.bind(this),
        onSegmentLeave: this._handleSegmentLeave.bind(this),
        onMonthClick: this._handleMonthClick.bind(this),
        onMonthHover: this._handleMonthHover.bind(this),
        onMonthLeave: this._handleMonthLeave.bind(this)
      }
    };

    // Create ring instances
    this.rings = RingFactory.createRings(
      this.ringConfigs,
      this.ringBoundaries,
      context
    );

    // Render all rings
    this.rings.forEach(ring => {
      ring.render();
    });

    // Add month interaction overlays spanning all rings
    this._addMonthInteractionOverlays();
  }

  /**
   * Add permanent month agenda buttons with opacity transitions
   * @private
   */
  _addMonthInteractionOverlays() {
    if (this.rings.length === 0) return;

    const year = this.generalConfig.startYear;
    const monthSegments = LayoutCalculator.getMonthSegments(year);
    const daysInYear = LayoutCalculator.getDaysInYear(year);

    // Find innermost and outermost ring boundaries
    const innermost = Math.min(...this.rings.map(ring => ring.inner));
    const outermost = Math.max(...this.rings.map(ring => ring.outer));

    // Store all month buttons
    this.monthButtons = [];

    // Create button and hover area for each month
    monthSegments.forEach((monthData, index) => {
      const { month, startDay, endDay } = monthData;

      // Calculate angles for this month
      const startAngle = ((startDay - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endDay / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const centerAngle = (startAngle + endAngle) / 2;
      const arcSpan = endAngle - startAngle;

      // Create permanent button (initially invisible with opacity: 0)
      const button = this._createMonthButtonOverlay(
        startAngle,
        endAngle,
        centerAngle,
        arcSpan,
        outermost,
        month,
        year,
        startDay,
        endDay
      );

      // Store button with metadata for mouse position detection
      button._startAngle = startAngle;
      button._endAngle = endAngle;
      button._month = month;
      button._year = year;
      button._startDay = startDay;
      button._endDay = endDay;

      this.monthButtons.push(button);
    });

    // Use global mousemove on SVG to detect which month we're in
    // This doesn't block any other hover events
    let currentMonth = null;

    this.svg.addEventListener('mousemove', (e) => {
      // Use SVG's built-in coordinate conversion for accuracy
      const pt = this.svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(this.svg.getScreenCTM().inverse());

      // Convert to polar coordinates
      const dx = svgPt.x - this.cx;
      const dy = svgPt.y - this.cy;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Check if we're within the wheel area
      if (radius >= innermost && radius <= outermost + 60) {
        // Find which month this angle belongs to
        let foundMonth = null;

        for (const btn of this.monthButtons) {
          let start = btn._startAngle;
          let end = btn._endAngle;
          let testAngle = angle;

          // Normalize angles to handle ±π boundary
          // If segment crosses the boundary, normalize everything to [0, 2π]
          if (end < start) {
            // Segment wraps around (e.g., December to January)
            if (start < 0) start += 2 * Math.PI;
            if (end < 0) end += 2 * Math.PI;
            if (testAngle < 0) testAngle += 2 * Math.PI;
          } else {
            // Check if we need to shift testAngle to match the segment's range
            // If testAngle and start are on opposite sides of ±π, normalize
            if (Math.abs(testAngle - start) > Math.PI) {
              if (testAngle < 0) testAngle += 2 * Math.PI;
              else if (start < 0) {
                start += 2 * Math.PI;
                end += 2 * Math.PI;
              }
            }
          }

          const inRange = (testAngle >= start && testAngle <= end);

          if (inRange) {
            foundMonth = btn._month;
            if (btn !== this.activeMonthButton) {
              btn.style.opacity = '1';
            }
          } else {
            if (btn !== this.activeMonthButton) {
              btn.style.opacity = '0';
            }
          }
        }

        currentMonth = foundMonth;
      } else {
        // Outside wheel - hide all non-active buttons
        for (const btn of this.monthButtons) {
          if (btn !== this.activeMonthButton) {
            btn.style.opacity = '0';
          }
        }
        currentMonth = null;
      }
    });
  }

  /**
   * Create permanent month agenda button (pill-shaped with curved text)
   * @private
   */
  _createMonthButtonOverlay(startAngle, endAngle, centerAngle, arcSpan, outermost, month, year, startDay, endDay) {
    // Position button closer to the wheel
    const buttonRadius = outermost + 15;

    // Calculate button path along the arc (smaller initially)
    const buttonArcSpan = arcSpan * 0.5; // Button takes 50% of month arc initially
    const buttonStartAngle = centerAngle - buttonArcSpan / 2;
    const buttonEndAngle = centerAngle + buttonArcSpan / 2;

    // Button thickness (smaller initially)
    const buttonThickness = 16;
    const buttonInnerRadius = buttonRadius - buttonThickness / 2;
    const buttonOuterRadius = buttonRadius + buttonThickness / 2;

    // Create button group (initially invisible)
    const buttonGroup = this._createSVGElement('g', {
      'class': 'month-agenda-button',
      'cursor': 'pointer',
      'pointer-events': 'all', // Ensure button receives clicks even at low opacity
      'data-month': month,
      'data-year': year,
      'style': 'opacity: 0; transition: opacity 0.1s ease;'
    });

    // Create pill-shaped button background using arc path
    const buttonPath = LayoutCalculator.createArcPath(
      this.cx,
      this.cy,
      buttonInnerRadius,
      buttonOuterRadius,
      buttonStartAngle,
      buttonEndAngle
    );

    const buttonBackground = this._createSVGElement('path', {
      'd': buttonPath,
      'fill': '#3c3485', // Plandisc purple
      'stroke': '#3c3485',
      'stroke-width': '1'
    });
    buttonGroup.appendChild(buttonBackground);

    // Create curved text path for "VIS AGENDA"
    const textPathId = `agenda-text-path-${month}-${year}`;
    const textStartPoint = LayoutCalculator.polarToCartesian(this.cx, this.cy, buttonRadius, buttonStartAngle);
    const textEndPoint = LayoutCalculator.polarToCartesian(this.cx, this.cy, buttonRadius, buttonEndAngle);

    const textAngleDiff = buttonEndAngle - buttonStartAngle;
    const largeArc = textAngleDiff > Math.PI ? 1 : 0;

    const textPathD = `M ${textStartPoint.x} ${textStartPoint.y} A ${buttonRadius} ${buttonRadius} 0 ${largeArc} 1 ${textEndPoint.x} ${textEndPoint.y}`;

    const textPath = this._createSVGElement('path', {
      'id': textPathId,
      'd': textPathD,
      'fill': 'none'
    });
    this.defs.appendChild(textPath);

    // Create text element with curved text
    const textElement = this._createSVGElement('text', {
      'font-family': this.generalConfig.fontFamily,
      'font-size': '8',
      'font-weight': '600',
      'fill': '#ffffff',
      'letter-spacing': '0.5',
      'pointer-events': 'none',
      'style': 'user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;'
    });

    const textPathElement = this._createSVGElement('textPath', {
      'href': `#${textPathId}`,
      'startOffset': '50%',
      'text-anchor': 'middle',
      'dominant-baseline': 'middle'
    });
    textPathElement.textContent = 'VIS AGENDA';
    textElement.appendChild(textPathElement);
    buttonGroup.appendChild(textElement);

    // Store references for updating
    buttonGroup._textPathElement = textPathElement;
    buttonGroup._textPath = textPath;
    buttonGroup._textPathId = textPathId;
    buttonGroup._month = month;
    buttonGroup._buttonBackground = buttonBackground;
    buttonGroup._centerAngle = centerAngle;
    buttonGroup._arcSpan = arcSpan;
    buttonGroup._outermost = outermost;
    buttonGroup._buttonRadius = buttonRadius;

    // Make button clickable to open sidebar and update text
    buttonGroup.addEventListener('click', () => {
      // Close any previously open sidebar and reset previous button
      if (this.activeMonthButton && this.activeMonthButton !== buttonGroup) {
        this.activeMonthButton.style.opacity = '0';
        this.activeMonthButton.classList.remove('active-month');
        // Reset previous button text
        if (this.activeMonthButton._textPathElement) {
          this.activeMonthButton._textPathElement.textContent = 'VIS AGENDA';
        }
        // Reset previous button size
        this._resetButtonSize(this.activeMonthButton);
      }

      // Get month name
      const monthNames = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
                          'Juli', 'August', 'September', 'Oktober', 'November', 'December'];
      const monthName = monthNames[month];

      // Update button text to show month
      textPathElement.textContent = `${monthName.toUpperCase()} AGENDA`;

      // Expand the button
      this._expandButton(buttonGroup);

      // Set this button as active (grayed out while sidebar is open)
      this.activeMonthButton = buttonGroup;
      buttonGroup.style.opacity = '0.5';  // Gray out the button
      buttonGroup.classList.add('active-month');

      // Open sidebar
      this._handleMonthClick({ month, year, startDay, endDay });
    });

    this.svgGroups.overlay.appendChild(buttonGroup);

    return buttonGroup;
  }

  /**
   * Expand button when clicked
   * @private
   */
  _expandButton(buttonGroup) {
    if (!buttonGroup._buttonBackground) return;

    const centerAngle = buttonGroup._centerAngle;
    const arcSpan = buttonGroup._arcSpan;
    const outermost = buttonGroup._outermost;
    const buttonRadius = buttonGroup._buttonRadius;

    // Expanded dimensions
    const expandedRadius = outermost + 15;
    const expandedArcSpan = arcSpan * 0.7; // Expand to 70% of month arc
    const expandedThickness = 20; // Thicker when active

    const expandedStartAngle = centerAngle - expandedArcSpan / 2;
    const expandedEndAngle = centerAngle + expandedArcSpan / 2;
    const expandedInnerRadius = expandedRadius - expandedThickness / 2;
    const expandedOuterRadius = expandedRadius + expandedThickness / 2;

    // Create expanded path
    const expandedPath = LayoutCalculator.createArcPath(
      this.cx,
      this.cy,
      expandedInnerRadius,
      expandedOuterRadius,
      expandedStartAngle,
      expandedEndAngle
    );

    // Update button background path with transition
    buttonGroup._buttonBackground.style.transition = 'd 0.2s ease';
    buttonGroup._buttonBackground.setAttribute('d', expandedPath);

    // Update text path to match expanded button
    if (buttonGroup._textPath) {
      const textStartPoint = LayoutCalculator.polarToCartesian(this.cx, this.cy, buttonRadius, expandedStartAngle);
      const textEndPoint = LayoutCalculator.polarToCartesian(this.cx, this.cy, buttonRadius, expandedEndAngle);
      const textAngleDiff = expandedEndAngle - expandedStartAngle;
      const largeArc = textAngleDiff > Math.PI ? 1 : 0;
      const expandedTextPath = `M ${textStartPoint.x} ${textStartPoint.y} A ${buttonRadius} ${buttonRadius} 0 ${largeArc} 1 ${textEndPoint.x} ${textEndPoint.y}`;
      buttonGroup._textPath.setAttribute('d', expandedTextPath);
    }
  }

  /**
   * Reset button to original size
   * @private
   */
  _resetButtonSize(buttonGroup) {
    if (!buttonGroup._buttonBackground) return;

    const centerAngle = buttonGroup._centerAngle;
    const arcSpan = buttonGroup._arcSpan;
    const outermost = buttonGroup._outermost;
    const buttonRadius = buttonGroup._buttonRadius;

    // Original dimensions
    const buttonArcSpan = arcSpan * 0.5;
    const buttonThickness = 16;

    const buttonStartAngle = centerAngle - buttonArcSpan / 2;
    const buttonEndAngle = centerAngle + buttonArcSpan / 2;
    const buttonInnerRadius = buttonRadius - buttonThickness / 2;
    const buttonOuterRadius = buttonRadius + buttonThickness / 2;

    // Create original path
    const originalPath = LayoutCalculator.createArcPath(
      this.cx,
      this.cy,
      buttonInnerRadius,
      buttonOuterRadius,
      buttonStartAngle,
      buttonEndAngle
    );

    // Reset button background path
    buttonGroup._buttonBackground.setAttribute('d', originalPath);

    // Reset text path to original size
    if (buttonGroup._textPath) {
      const textStartPoint = LayoutCalculator.polarToCartesian(this.cx, this.cy, buttonRadius, buttonStartAngle);
      const textEndPoint = LayoutCalculator.polarToCartesian(this.cx, this.cy, buttonRadius, buttonEndAngle);
      const textAngleDiff = buttonEndAngle - buttonStartAngle;
      const largeArc = textAngleDiff > Math.PI ? 1 : 0;
      const originalTextPath = `M ${textStartPoint.x} ${textStartPoint.y} A ${buttonRadius} ${buttonRadius} 0 ${largeArc} 1 ${textEndPoint.x} ${textEndPoint.y}`;
      buttonGroup._textPath.setAttribute('d', originalTextPath);
    }
  }

  /**
   * Handle segment click
   * @private
   */
  _handleSegmentClick(segmentData) {
    if (this.generalConfig.enableDetailPanel) {
      this._showDetailPanel(segmentData);
    }
  }

  /**
   * Handle segment hover
   * @private
   */
  _handleSegmentHover(segmentData) {
    this._showCenterInfo(segmentData);
  }

  /**
   * Handle segment leave
   * @private
   */
  _handleSegmentLeave() {
    this._clearCenterInfo();
  }

  /**
   * Handle month click - open month events sidebar
   * @private
   */
  _handleMonthClick(monthData) {
    this._showMonthSidebar(monthData);
  }

  /**
   * Navigate to a specific month by button index
   * @private
   */
  _navigateToMonthByIndex(buttonIndex) {
    if (buttonIndex < 0 || buttonIndex >= this.monthButtons.length) return;

    const targetButton = this.monthButtons[buttonIndex];
    if (!targetButton) return;

    // Close any previously open sidebar and reset previous button
    if (this.activeMonthButton && this.activeMonthButton !== targetButton) {
      this.activeMonthButton.style.opacity = '0';
      this.activeMonthButton.classList.remove('active-month');
      // Reset previous button text
      if (this.activeMonthButton._textPathElement) {
        this.activeMonthButton._textPathElement.textContent = 'VIS AGENDA';
      }
      // Reset previous button size
      this._resetButtonSize(this.activeMonthButton);
    }

    // Get month data from button
    const month = targetButton._month;
    const year = targetButton._year;
    const startDay = targetButton._startDay;
    const endDay = targetButton._endDay;

    // Get month name
    const monthNames = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
                        'Juli', 'August', 'September', 'Oktober', 'November', 'December'];
    const monthName = monthNames[month];

    // Update button text to show month
    if (targetButton._textPathElement) {
      targetButton._textPathElement.textContent = `${monthName.toUpperCase()} AGENDA`;
    }

    // Expand the button
    this._expandButton(targetButton);

    // Set this button as active (grayed out while sidebar is open)
    this.activeMonthButton = targetButton;
    targetButton.style.opacity = '0.5';  // Gray out the button
    targetButton.classList.add('active-month');

    // Open sidebar
    this._handleMonthClick({ month, year, startDay, endDay });
  }

  /**
   * Handle month hover
   * @private
   */
  _handleMonthHover(monthData) {
    // Optional: could show additional info
  }

  /**
   * Handle month leave
   * @private
   */
  _handleMonthLeave() {
    // Optional: clear any month-specific info
  }

  /**
   * Update data for DataRings
   * @param {Array} data - Event data
   * @param {string} ringName - Optional: target specific ring by name
   */
  update(data, ringName = null) {
    if (!Array.isArray(data)) {
      throw new Error('CircalifyCore: Data must be an array');
    }

    // Store all events for month sidebar filtering
    this.allEvents = data;

    this.rings.forEach(ring => {
      if (ring instanceof DataRing) {
        if (!ringName || ring.config.name === ringName) {
          ring.update(data);
        }
      }
    });
  }

  /**
   * Draw timeline indicator
   * @private
   */
  _drawTimeline() {
    this.svgGroups.timeline.innerHTML = '';

    // Find calendar rings to determine timeline boundaries
    const calendarRings = this.rings.filter(ring => ring instanceof CalendarRing);

    if (calendarRings.length === 0) {
      // No calendar rings, use default boundaries
      return;
    }

    // Get innermost and outermost boundaries of calendar rings
    const innermost = Math.min(...calendarRings.map(ring => ring.inner));
    const outermost = Math.max(...calendarRings.map(ring => ring.outer));

    const now = new Date();
    const dayOfYear = LayoutCalculator.getDayOfYear(now);
    const daysInYear = LayoutCalculator.getDaysInYear(now.getFullYear());
    const angle = (dayOfYear / daysInYear) * 2 * Math.PI - Math.PI / 2;

    const innerX = this.cx + innermost * Math.cos(angle);
    const innerY = this.cy + innermost * Math.sin(angle);
    const outerX = this.cx + outermost * Math.cos(angle);
    const outerY = this.cy + outermost * Math.sin(angle);

    const timeline = this._createSVGElement('line', {
      'x1': innerX,
      'y1': innerY,
      'x2': outerX,
      'y2': outerY,
      'stroke': '#e74c3c',
      'stroke-width': '1',
      'pointer-events': 'none',
      'filter': 'url(#glow-filter)',
      'class': 'timeline-indicator'
    });

    this.svgGroups.timeline.appendChild(timeline);
  }

  /**
   * Start timeline animation
   * @private
   */
  _startTimelineAnimation() {
    setInterval(() => {
      this._drawTimeline();
    }, 60000); // Update every minute
  }

  /**
   * Add zoom controls
   * @private
   */
  _addZoomControls() {
    const controlsGroup = this._createSVGElement('g', {
      'class': 'zoom-controls',
      'transform': `translate(${this.viewBoxSize - 60}, ${this.viewBoxSize - 120})`
    });

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

    // Zoom controls can be implemented as needed
    this.svgGroups.controls.appendChild(controlsGroup);
  }

  /**
   * Create detail panel
   * @private
   */
  _createDetailPanel(wrapper) {
    this.detailPanel = document.createElement('div');
    this.detailPanel.style.cssText = `
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%) translateX(20px);
      width: 320px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 24px;
      font-family: ${this.generalConfig.fontFamily};
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
      transition: all 0.2s ease;
    `;
    closeBtn.addEventListener('click', () => this._hideDetailPanel());

    this.detailPanel.appendChild(closeBtn);
    wrapper.appendChild(this.detailPanel);
  }

  /**
   * Show detail panel
   * @private
   */
  _showDetailPanel(segmentData) {
    if (!this.detailPanel) return;

    // Clear previous content
    const closeBtn = this.detailPanel.querySelector('button');
    this.detailPanel.innerHTML = '';
    this.detailPanel.appendChild(closeBtn);

    // Add content
    const title = document.createElement('h3');
    title.textContent = segmentData.label || 'Event';
    title.style.cssText = `
      margin: 0 0 15px 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    `;

    this.detailPanel.appendChild(title);

    // Show panel
    this.detailPanel.style.display = 'block';
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
   * Create month sidebar
   * @private
   */
  _createMonthSidebar(wrapper) {
    this.monthSidebar = document.createElement('div');
    this.monthSidebar.style.cssText = `
      position: absolute;
      right: 0;
      top: 0;
      width: 340px;
      height: 100%;
      background: white;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
      font-family: ${this.generalConfig.fontFamily};
      display: none;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      overflow: hidden;
    `;

    wrapper.appendChild(this.monthSidebar);
  }

  /**
   * Show month sidebar with events
   * @private
   */
  _showMonthSidebar(monthData) {
    if (!this.monthSidebar) return;

    const { month, year, startDay, endDay } = monthData;

    // Filter events for this month
    const monthEvents = this._filterMonthEvents(startDay, endDay, year);

    // Build sidebar content
    this.monthSidebar.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    `;

    const monthNames = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];

    // Left arrow
    const leftArrow = document.createElement('button');
    leftArrow.innerHTML = '&lt;';
    leftArrow.style.cssText = `
      background: transparent;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    `;
    leftArrow.addEventListener('mouseenter', () => leftArrow.style.background = '#f3f4f6');
    leftArrow.addEventListener('mouseleave', () => leftArrow.style.background = 'transparent');
    leftArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      // Navigate to previous month
      // Find current button index
      const currentIndex = this.monthButtons.findIndex(btn => btn._month === month && btn._year === year);
      // Use setTimeout to break the call stack and prevent infinite loops
      setTimeout(() => {
        if (currentIndex > 0) {
          // Navigate to previous button in array
          this._navigateToMonthByIndex(currentIndex - 1);
        } else if (currentIndex === 0 && this.monthButtons.length > 1) {
          // Wrap around to last month
          this._navigateToMonthByIndex(this.monthButtons.length - 1);
        }
      }, 0);
    });

    // Title
    const title = document.createElement('h2');
    title.textContent = `${monthNames[month]} ${year}`;
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      flex: 1;
      text-align: center;
    `;

    // Right arrow
    const rightArrow = document.createElement('button');
    rightArrow.innerHTML = '&gt;';
    rightArrow.style.cssText = `
      background: transparent;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    `;
    rightArrow.addEventListener('mouseenter', () => rightArrow.style.background = '#f3f4f6');
    rightArrow.addEventListener('mouseleave', () => rightArrow.style.background = 'transparent');
    rightArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      // Navigate to next month
      // Find current button index
      const currentIndex = this.monthButtons.findIndex(btn => btn._month === month && btn._year === year);
      // Use setTimeout to break the call stack and prevent infinite loops
      setTimeout(() => {
        if (currentIndex >= 0 && currentIndex < this.monthButtons.length - 1) {
          // Navigate to next button in array
          this._navigateToMonthByIndex(currentIndex + 1);
        } else if (currentIndex === this.monthButtons.length - 1 && this.monthButtons.length > 1) {
          // Wrap around to first month
          this._navigateToMonthByIndex(0);
        }
      }, 0);
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: transparent;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
      margin-left: 8px;
    `;
    closeBtn.addEventListener('click', () => this._hideMonthSidebar());
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = '#f3f4f6');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = 'transparent');

    header.appendChild(leftArrow);
    header.appendChild(title);
    header.appendChild(rightArrow);
    header.appendChild(closeBtn);
    this.monthSidebar.appendChild(header);

    // Toggle for zoom
    const toggleSection = document.createElement('div');
    toggleSection.style.cssText = `
      padding: 12px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const toggleLabel = document.createElement('span');
    toggleLabel.textContent = 'Zoom Ind Måned';
    toggleLabel.style.cssText = `
      font-size: 13px;
      color: #374151;
      font-weight: 500;
    `;

    const toggle = document.createElement('label');
    toggle.style.cssText = `
      position: relative;
      display: inline-block;
      width: 42px;
      height: 24px;
      cursor: pointer;
    `;

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.style.cssText = `
      opacity: 0;
      width: 0;
      height: 0;
    `;

    const toggleSlider = document.createElement('span');
    toggleSlider.style.cssText = `
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #d1d5db;
      transition: 0.3s;
      border-radius: 24px;
    `;

    const toggleKnob = document.createElement('span');
    toggleKnob.style.cssText = `
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    `;

    toggleSlider.appendChild(toggleKnob);
    toggle.appendChild(toggleInput);
    toggle.appendChild(toggleSlider);
    toggleSection.appendChild(toggleLabel);
    toggleSection.appendChild(toggle);
    this.monthSidebar.appendChild(toggleSection);

    // Events list
    const eventsContainer = document.createElement('div');
    eventsContainer.style.cssText = `
      overflow-y: auto;
      height: calc(100% - 140px);
      padding: 16px 0;
    `;

    if (monthEvents.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.textContent = 'Ingen begivenheder i denne måned';
      emptyState.style.cssText = `
        padding: 24px;
        text-align: center;
        color: #999;
        font-size: 14px;
      `;
      eventsContainer.appendChild(emptyState);
    } else {
      // Render events directly without day grouping
      monthEvents.forEach(event => {
        const eventItem = this._createEventItem(event);
        eventsContainer.appendChild(eventItem);
      });
    }

    this.monthSidebar.appendChild(eventsContainer);

    // Show sidebar
    this.monthSidebar.style.display = 'block';
    requestAnimationFrame(() => {
      this.monthSidebar.style.opacity = '1';
      this.monthSidebar.style.transform = 'translateX(0)';
    });
  }

  /**
   * Hide month sidebar
   * @private
   */
  _hideMonthSidebar() {
    if (!this.monthSidebar) return;

    // Reset active button state
    if (this.activeMonthButton) {
      this.activeMonthButton.style.opacity = '0';
      this.activeMonthButton.classList.remove('active-month');
      // Reset text to default
      if (this.activeMonthButton._textPathElement) {
        this.activeMonthButton._textPathElement.textContent = 'VIS AGENDA';
      }
      // Reset button size
      this._resetButtonSize(this.activeMonthButton);
      this.activeMonthButton = null;
    }

    this.monthSidebar.style.opacity = '0';
    this.monthSidebar.style.transform = 'translateX(100%)';
    setTimeout(() => {
      this.monthSidebar.style.display = 'none';
    }, 300);
  }

  /**
   * Filter events for a specific month
   * @private
   */
  _filterMonthEvents(startDay, endDay, year) {
    return this.allEvents.filter(event => {
      const eventStartDate = new Date(event.startDate || event.date);
      const eventEndDate = new Date(event.endDate || event.date);
      const eventStartDay = LayoutCalculator.getDayOfYear(eventStartDate);
      const eventEndDay = LayoutCalculator.getDayOfYear(eventEndDate);

      // Check if event overlaps with month
      return eventStartDay <= endDay && eventEndDay >= startDay;
    });
  }

  /**
   * Group events by day
   * @private
   */
  _groupEventsByDay(events, year) {
    const grouped = {};

    events.forEach(event => {
      const startDate = new Date(event.startDate || event.date);
      const endDate = new Date(event.endDate || event.date);

      // Add event to each day it spans
      const startDay = LayoutCalculator.getDayOfYear(startDate);
      const endDay = LayoutCalculator.getDayOfYear(endDate);

      for (let day = startDay; day <= endDay; day++) {
        if (!grouped[day]) {
          grouped[day] = [];
        }
        // Avoid duplicates
        if (!grouped[day].find(e => e === event)) {
          grouped[day].push(event);
        }
      }
    });

    return grouped;
  }

  /**
   * Create day group element
   * @private
   */
  _createDayGroup(dayNum, events, year) {
    const dayGroup = document.createElement('div');
    dayGroup.style.cssText = `
      margin-bottom: 20px;
    `;

    // Day header
    const date = new Date(year, 0, dayNum);
    const dayNames = ['søn.', 'man.', 'tirs.', 'ons.', 'tors.', 'fre.', 'lør.'];
    const dayName = dayNames[date.getDay()];

    const dayHeader = document.createElement('div');
    dayHeader.style.cssText = `
      padding: 6px 20px;
      font-size: 11px;
      color: #6b7280;
      font-weight: 600;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    `;
    dayHeader.textContent = `${date.getDate()} ${dayName}`;

    dayGroup.appendChild(dayHeader);

    // Events for this day
    events.forEach(event => {
      const eventItem = this._createEventItem(event);
      dayGroup.appendChild(eventItem);
    });

    return dayGroup;
  }

  /**
   * Create event item element
   * @private
   */
  _createEventItem(event) {
    const eventItem = document.createElement('div');
    eventItem.style.cssText = `
      display: flex;
      align-items: center;
      padding: 14px 20px;
      gap: 12px;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid #f3f4f6;
    `;

    eventItem.addEventListener('mouseenter', () => {
      eventItem.style.background = '#fafafa';
    });
    eventItem.addEventListener('mouseleave', () => {
      eventItem.style.background = 'transparent';
    });

    // Circle indicator (not a checkbox)
    const circle = document.createElement('div');
    circle.style.cssText = `
      width: 20px;
      height: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 50%;
      cursor: pointer;
      flex-shrink: 0;
      background: white;
      transition: all 0.2s;
    `;

    // Add hover effect to circle
    circle.addEventListener('mouseenter', () => {
      circle.style.borderColor = '#b0b0b0';
    });
    circle.addEventListener('mouseleave', () => {
      circle.style.borderColor = '#e0e0e0';
    });

    // Vertical color bar + content container
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    `;

    // Vertical color bar
    const colorBar = document.createElement('div');
    colorBar.style.cssText = `
      width: 4px;
      height: 40px;
      background: ${event.color || '#5a9aa8'};
      border-radius: 2px;
      flex-shrink: 0;
    `;

    // Content container
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      min-width: 0;
    `;

    // Event title
    const title = document.createElement('div');
    title.textContent = event.label || 'Untitled Event';
    title.style.cssText = `
      font-size: 14px;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 4px;
      word-wrap: break-word;
      line-height: 1.3;
    `;

    // Event dates
    const dates = document.createElement('div');
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')} ${['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'][d.getMonth()]}`;
    };

    let dateText = '';
    if (event.startDate && event.endDate && event.startDate !== event.endDate) {
      dateText = `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
    } else if (event.startDate) {
      dateText = formatDate(event.startDate);
    }

    if (dateText) {
      dates.textContent = dateText;
      dates.style.cssText = `
        font-size: 12px;
        color: #999;
        line-height: 1.3;
      `;
      content.appendChild(title);
      content.appendChild(dates);
    } else {
      content.appendChild(title);
    }

    contentWrapper.appendChild(colorBar);
    contentWrapper.appendChild(content);

    eventItem.appendChild(circle);
    eventItem.appendChild(contentWrapper);

    return eventItem;
  }

  /**
   * Show event info in center with colored background and color square
   * @private
   */
  _showCenterInfo(eventData) {
    this.svgGroups.centerInfo.innerHTML = '';

    if (!eventData) return;

    // Background circle with event color
    const bgCircle = this._createSVGElement('circle', {
      'cx': this.cx,
      'cy': this.cy,
      'r': this.generalConfig.innerRadius - 10,
      'fill': eventData.color || '#5a9aa8',
      'opacity': '0.15',
      'class': 'center-info-bg'
    });
    this.svgGroups.centerInfo.appendChild(bgCircle);

    // Color indicator square
    const squareSize = 16;
    const colorSquare = this._createSVGElement('rect', {
      'x': this.cx - 80,
      'y': this.cy - 30,
      'width': squareSize,
      'height': squareSize,
      'fill': eventData.color || '#5a9aa8',
      'rx': '2',
      'ry': '2',
      'class': 'center-color-indicator'
    });
    this.svgGroups.centerInfo.appendChild(colorSquare);

    // Event label
    const label = this._createSVGElement('text', {
      'x': this.cx - 80 + squareSize + 10,
      'y': this.cy - 20,
      'text-anchor': 'start',
      'dominant-baseline': 'middle',
      'font-family': this.generalConfig.fontFamily,
      'font-size': '18',
      'font-weight': '600',
      'fill': '#333',
      'style': 'user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;'
    });
    label.textContent = eventData.label || '';
    this.svgGroups.centerInfo.appendChild(label);

    // Date range (if available)
    if (eventData.startDate || eventData.endDate) {
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      let dateText = '';
      if (eventData.startDate && eventData.endDate) {
        dateText = `${formatDate(eventData.startDate)} - ${formatDate(eventData.endDate)}`;
      } else if (eventData.startDate) {
        dateText = formatDate(eventData.startDate);
      }

      const dateLabel = this._createSVGElement('text', {
        'x': this.cx - 80 + squareSize + 10,
        'y': this.cy + 5,
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'font-family': this.generalConfig.fontFamily,
        'font-size': '13',
        'font-weight': '400',
        'fill': '#666',
        'style': 'user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;'
      });
      dateLabel.textContent = dateText;
      this.svgGroups.centerInfo.appendChild(dateLabel);
    }
  }

  /**
   * Clear center info display
   * @private
   */
  _clearCenterInfo() {
    this.svgGroups.centerInfo.innerHTML = '';
  }

  /**
   * Inject CSS styles
   * @private
   */
  _injectStyles() {
    if (document.getElementById('circalify-core-styles')) return;

    const style = document.createElement('style');
    style.id = 'circalify-core-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create SVG element
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
   * Destroy and clean up
   */
  destroy() {
    this.rings.forEach(ring => ring.destroy());
    this.rings = [];

    if (this.container) {
      this.container.innerHTML = '';
    }

    const styles = document.getElementById('circalify-core-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CircalifyCore;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return CircalifyCore;
  });
} else {
  window.CircalifyCore = CircalifyCore;
}
