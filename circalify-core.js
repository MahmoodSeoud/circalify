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
        onSegmentHover: this._handleSegmentHover.bind(this)
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
   * Update data for DataRings
   * @param {Array} data - Event data
   * @param {string} ringName - Optional: target specific ring by name
   */
  update(data, ringName = null) {
    if (!Array.isArray(data)) {
      throw new Error('CircalifyCore: Data must be an array');
    }

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

    const now = new Date();
    const dayOfYear = LayoutCalculator.getDayOfYear(now);
    const daysInYear = LayoutCalculator.getDaysInYear(now.getFullYear());
    const angle = (dayOfYear / daysInYear) * 2 * Math.PI - Math.PI / 2;

    const innerX = this.cx + (this.generalConfig.innerRadius - 10) * Math.cos(angle);
    const innerY = this.cy + (this.generalConfig.innerRadius - 10) * Math.sin(angle);
    const outerX = this.cx + (this.generalConfig.outerRadius + 10) * Math.cos(angle);
    const outerY = this.cy + (this.generalConfig.outerRadius + 10) * Math.sin(angle);

    const timeline = this._createSVGElement('line', {
      'x1': innerX,
      'y1': innerY,
      'x2': outerX,
      'y2': outerY,
      'stroke': '#e74c3c',
      'stroke-width': '2',
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
   * Show event info in center
   * @private
   */
  _showCenterInfo(eventData) {
    this.svgGroups.centerInfo.innerHTML = '';

    const label = this._createSVGElement('text', {
      'x': this.cx,
      'y': this.cy - 15,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-family': this.generalConfig.fontFamily,
      'font-size': '18',
      'font-weight': '600',
      'fill': '#333'
    });
    label.textContent = eventData.label || '';

    this.svgGroups.centerInfo.appendChild(label);
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
