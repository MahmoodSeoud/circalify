/**
 * BaseRing - Abstract base class for all ring types
 * Requires: constants.js
 * @license MIT
 */

class BaseRing {
  /**
   * @param {Object} config - Ring configuration
   * @param {Object} boundaries - Ring boundaries {inner, outer, center}
   * @param {Object} context - Shared context {cx, cy, svgGroups, generalConfig, defs}
   */
  constructor(config, boundaries, context) {
    if (new.target === BaseRing) {
      throw new Error('BaseRing is abstract and cannot be instantiated directly');
    }

    this.config = config;
    this.boundaries = boundaries;
    this.context = context;

    // Extract common properties
    this.cx = context.cx;
    this.cy = context.cy;
    this.svgGroups = context.svgGroups;
    this.generalConfig = context.generalConfig;
    this.defs = context.defs;

    // Ring properties
    this.inner = boundaries.inner;
    this.outer = boundaries.outer;
    this.center = boundaries.center;
    this.height = boundaries.height;

    // Elements created by this ring
    this.elements = [];

    // Store constants as instance properties for easy access
    // Fallback to defaults if constants.js not loaded
    const constants = (typeof window !== 'undefined' && window.CIRCALIFY_CONSTANTS) || {};
    this.GEOMETRY = constants.GEOMETRY || {
      FULL_CIRCLE: 2 * Math.PI,
      HALF_CIRCLE: Math.PI,
      QUARTER_CIRCLE: Math.PI / 2,
      THREE_QUARTER_CIRCLE: 3 * Math.PI / 2,
      ANGLE_OFFSET_TOP: -Math.PI / 2
    };
    this.TIME = constants.TIME || {
      MONTH_ABBR: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      QUARTER_LABELS: ['Q1', 'Q2', 'Q3', 'Q4']
    };
    this.STYLING = constants.STYLING || {
      RING_BACKGROUND_OPACITY: 0.6,
      RING_SEPARATOR_OPACITY: 0.4,
      EVENT_STROKE_WIDTH: 1,
      EVENT_STROKE_OPACITY: 0.85
    };
    this.DIMENSIONS = constants.DIMENSIONS || {
      MIN_TRUNCATE_CHARS: 2
    };
    this.ID_GENERATION = constants.ID_GENERATION || {
      RADIX: 36,
      START_INDEX: 2,
      LENGTH: 9
    };
  }

  /**
   * Render the ring - must be implemented by subclasses
   * @abstract
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Update ring data - optional override
   * @param {*} data - New data for the ring
   */
  update(data) {
    // Default implementation does nothing
    // Subclasses can override to handle data updates
  }

  /**
   * Destroy the ring and clean up
   */
  destroy() {
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.elements = [];
  }

  /**
   * Create an SVG element with namespace
   * @protected
   */
  _createSVGElement(type, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    return element;
  }

  /**
   * Create a donut (full ring) path
   * @protected
   */
  _createDonutPath(innerRadius, outerRadius) {
    return LayoutCalculator.createDonutPath(this.cx, this.cy, innerRadius, outerRadius);
  }

  /**
   * Create an arc segment path
   * @protected
   */
  _createArcPath(innerRadius, outerRadius, startAngle, endAngle) {
    return LayoutCalculator.createArcPath(
      this.cx,
      this.cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    );
  }

  /**
   * Convert polar to cartesian coordinates
   * @protected
   */
  _polarToCartesian(radius, angle) {
    return LayoutCalculator.polarToCartesian(this.cx, this.cy, radius, angle);
  }

  /**
   * Draw the base ring background
   * @protected
   */
  _drawRingBackground() {
    const ringPath = this._createDonutPath(this.inner, this.outer);
    const ringElement = this._createSVGElement('path', {
      'd': ringPath,
      'fill': this.config.color,
      'stroke': 'rgba(160, 160, 160, 0.5)',
      'stroke-width': String(this.STYLING.EVENT_STROKE_WIDTH),
      'opacity': String(this.STYLING.RING_BACKGROUND_OPACITY),
      'class': `ring-${this.config.type}`
    });

    this.svgGroups.rings.appendChild(ringElement);
    this.elements.push(ringElement);

    return ringElement;
  }

  /**
   * Draw separator lines between segments
   * @protected
   */
  _drawSeparator(angle) {
    if (!this.config.separator) return;

    const innerPoint = this._polarToCartesian(this.inner, angle);
    const outerPoint = this._polarToCartesian(this.outer, angle);

    const separator = this._createSVGElement('line', {
      'x1': innerPoint.x,
      'y1': innerPoint.y,
      'x2': outerPoint.x,
      'y2': outerPoint.y,
      'stroke': 'rgba(160, 160, 160, 0.4)',
      'stroke-width': String(this.STYLING.EVENT_STROKE_WIDTH),
      'class': 'ring-separator'
    });

    this.svgGroups.rings.appendChild(separator);
    this.elements.push(separator);
  }

  /**
   * Create curved text path for labels
   * @protected
   */
  _createCurvedTextPath(radius, startAngle, endAngle, reverse = false) {
    const startPoint = this._polarToCartesian(radius, startAngle);
    const endPoint = this._polarToCartesian(radius, endAngle);

    let angleDiff = Math.abs(endAngle - startAngle);
    while (angleDiff > this.GEOMETRY.FULL_CIRCLE) {
      angleDiff -= this.GEOMETRY.FULL_CIRCLE;
    }

    const largeArc = angleDiff > this.GEOMETRY.HALF_CIRCLE ? 1 : 0;
    const sweepFlag = reverse ? 0 : 1;

    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${endPoint.x} ${endPoint.y}`;
  }

  /**
   * Determine if text should be flipped to remain upright when displayed on a circular path.
   * Text on the bottom half of the circle (between π/2 and 3π/2 radians) should be flipped
   * to prevent appearing upside-down to the reader.
   *
   * @param {number} angle - The center angle of the text in radians
   * @returns {boolean} True if text should be flipped, false otherwise
   * @protected
   */
  _shouldFlipText(angle) {
    // Normalize angle to [0, 2π) range by rotating 90 degrees (π/2) clockwise
    // This adjustment accounts for the circular layout starting at the top (12 o'clock)
    let adjustedAngle = angle + this.GEOMETRY.QUARTER_CIRCLE;

    // Ensure angle is in positive range [0, 2π)
    while (adjustedAngle < 0) {
      adjustedAngle += this.GEOMETRY.FULL_CIRCLE;
    }
    while (adjustedAngle >= this.GEOMETRY.FULL_CIRCLE) {
      adjustedAngle -= this.GEOMETRY.FULL_CIRCLE;
    }

    // Flip text if it's on the bottom half of the circle (between π/2 and 3π/2)
    return adjustedAngle > this.GEOMETRY.QUARTER_CIRCLE &&
           adjustedAngle < this.GEOMETRY.THREE_QUARTER_CIRCLE;
  }

  /**
   * Add curved text label to ring
   * @protected
   */
  _addCurvedLabel(text, centerAngle, arcSpan, radius, options = {}, parentGroup = null) {
    const {
      fontSize = this.config.fontSize,
      fontColor = this.config.fontColor,
      fontWeight = this.config.fontWeight || '500',
      opacity = '1',
      group = this.svgGroups.rings
    } = options;

    // Use parentGroup if provided, otherwise use group from options
    const targetGroup = parentGroup || group;

    // Determine if text should be flipped to stay upright
    const shouldFlip = this._shouldFlipText(centerAngle);

    let startAngle, endAngle;
    if (shouldFlip) {
      startAngle = centerAngle + arcSpan / 2;
      endAngle = centerAngle - arcSpan / 2;
    } else {
      startAngle = centerAngle - arcSpan / 2;
      endAngle = centerAngle + arcSpan / 2;
    }

    const pathId = this._generateUniqueId(`text-path-${this.config.type}-${this.config.index}`);
    const pathD = this._createCurvedTextPath(radius, startAngle, endAngle, shouldFlip);

    // Add path to defs
    const path = this._createSVGElement('path', {
      'id': pathId,
      'd': pathD,
      'fill': 'none'
    });
    this.defs.appendChild(path);
    this.elements.push(path);

    // Create text element
    const textElement = this._createSVGElement('text', {
      'font-family': this.generalConfig.fontFamily,
      'font-size': fontSize,
      'font-weight': fontWeight,
      'fill': fontColor,
      'opacity': opacity,
      'class': `${this.config.type}-label`,
      'style': 'user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;'
    });

    const textPath = this._createSVGElement('textPath', {
      'href': `#${pathId}`,
      'startOffset': '50%',
      'text-anchor': 'middle',
      'dominant-baseline': 'middle'
    });
    textPath.textContent = text;

    textElement.appendChild(textPath);
    targetGroup.appendChild(textElement);
    this.elements.push(textElement);

    return textElement;
  }

  /**
   * Add radial text label (pointing outward from center)
   * @protected
   */
  _addRadialLabel(text, angle, radius, options = {}) {
    const {
      fontSize = this.config.fontSize,
      fontColor = this.config.fontColor,
      fontWeight = this.config.fontWeight || '500',
      group = this.svgGroups.rings
    } = options;

    const point = this._polarToCartesian(radius, angle);
    let rotationAngle = (angle * 180 / Math.PI);

    // Keep text upright
    if (rotationAngle > 90 && rotationAngle < 270) {
      rotationAngle += 180;
    }

    const textElement = this._createSVGElement('text', {
      'x': point.x,
      'y': point.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-family': this.generalConfig.fontFamily,
      'font-size': fontSize,
      'font-weight': fontWeight,
      'fill': fontColor,
      'transform': `rotate(${rotationAngle}, ${point.x}, ${point.y})`,
      'class': `${this.config.type}-label`,
      'style': 'user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;'
    });
    textElement.textContent = text;

    group.appendChild(textElement);
    this.elements.push(textElement);

    return textElement;
  }

  /**
   * Generate a unique ID for SVG elements
   * @param {string} prefix - Optional prefix for the ID
   * @returns {string} A unique ID string
   * @protected
   */
  _generateUniqueId(prefix = 'element') {
    const randomString = Math.random()
      .toString(this.ID_GENERATION.RADIX)
      .substring(this.ID_GENERATION.START_INDEX, this.ID_GENERATION.START_INDEX + this.ID_GENERATION.LENGTH);
    return `${prefix}-${randomString}`;
  }

  /**
   * Truncate text to fit available space
   * @protected
   */
  _truncateText(text, maxChars) {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    if (maxChars < this.DIMENSIONS.MIN_TRUNCATE_CHARS) return '';
    return text.substring(0, maxChars);
  }

  /**
   * Get year from general config
   * @protected
   */
  _getYear() {
    return this.generalConfig.startYear;
  }

  /**
   * Get days in current year
   * @protected
   */
  _getDaysInYear() {
    return LayoutCalculator.getDaysInYear(this._getYear());
  }
}

// Export for ES6 modules
export default BaseRing;

// Also make available globally for browser compatibility
if (typeof window !== 'undefined') {
  window.BaseRing = BaseRing;
}
