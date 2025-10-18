/**
 * BaseRing - Abstract base class for all ring types
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
      'stroke': 'rgba(255, 255, 255, 0.8)',
      'stroke-width': '1',
      'opacity': '0.6',
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
      'stroke': 'rgba(255, 255, 255, 0.5)',
      'stroke-width': '1.5',
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
    while (angleDiff > 2 * Math.PI) angleDiff -= 2 * Math.PI;

    const largeArc = angleDiff > Math.PI ? 1 : 0;
    const sweepFlag = reverse ? 0 : 1;

    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${endPoint.x} ${endPoint.y}`;
  }

  /**
   * Add curved text label to ring
   * @protected
   */
  _addCurvedLabel(text, centerAngle, arcSpan, radius, options = {}) {
    const {
      fontSize = this.config.fontSize,
      fontColor = this.config.fontColor,
      fontWeight = this.config.fontWeight || '500',
      group = this.svgGroups.rings
    } = options;

    // Determine if text should be flipped to stay upright
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

    const pathId = `text-path-${this.config.type}-${this.config.index}-${Math.random().toString(36).substr(2, 9)}`;
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
    group.appendChild(textElement);
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
   * Truncate text to fit available space
   * @protected
   */
  _truncateText(text, maxChars) {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    if (maxChars < 2) return '';
    return text.substring(0, Math.max(2, maxChars - 2)) + '..';
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

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = BaseRing;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return BaseRing;
  });
} else {
  window.BaseRing = BaseRing;
}
