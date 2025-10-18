/**
 * DataRing - Renders event/data arcs (preserves original arc rendering)
 * @license MIT
 */

class DataRing extends BaseRing {
  constructor(config, boundaries, context) {
    super(config, boundaries, context);
    this.data = [];
    this.eventElements = [];
  }

  /**
   * Render the data ring
   */
  render() {
    // Draw background with day segments
    this._drawRingBackground();
    this._drawDaySegments();

    // Render any existing data
    if (this.data.length > 0) {
      this._renderEvents();
    }
  }

  /**
   * Update ring with new data
   * @param {Array} data - Array of event objects
   */
  update(data) {
    if (!Array.isArray(data)) {
      console.warn('DataRing.update: data must be an array');
      return;
    }

    this.data = data;
    this._clearEvents();
    this._renderEvents();
  }

  /**
   * Draw day segments (365 segments with hover interaction)
   * @private
   */
  _drawDaySegments() {
    const daysInYear = this._getDaysInYear();
    const year = this._getYear();

    for (let day = 1; day <= daysInYear; day++) {
      const startAngle = ((day - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (day / daysInYear) * 2 * Math.PI - Math.PI / 2;

      const segmentPath = this._createArcPath(
        this.inner,
        this.outer,
        startAngle,
        endAngle
      );

      const segment = this._createSVGElement('path', {
        'd': segmentPath,
        'fill': 'transparent',
        'stroke': 'rgba(255, 255, 255, 0.3)',
        'stroke-width': '0.5',
        'class': 'day-segment',
        'data-day': day,
        'data-year': year,
        'cursor': 'pointer'
      });

      // Add hover interaction if enabled
      if (this.config.interactive) {
        segment.addEventListener('mouseenter', () => {
          if (!segment.hasAttribute('data-has-event')) {
            segment.setAttribute('fill', 'rgba(0, 0, 0, 0.05)');
          }
        });

        segment.addEventListener('mouseleave', () => {
          if (!segment.hasAttribute('data-has-event')) {
            segment.setAttribute('fill', 'transparent');
          }
        });
      }

      this.svgGroups.rings.appendChild(segment);
      this.elements.push(segment);
    }
  }

  /**
   * Render all events
   * @private
   */
  _renderEvents() {
    this.data.forEach(event => {
      this._renderEventArc(event);
    });
  }

  /**
   * Clear all event elements
   * @private
   */
  _clearEvents() {
    this.eventElements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    this.eventElements = [];
  }

  /**
   * Render a single event arc (preserves original logic from circalify-enhanced.js)
   * @private
   */
  _renderEventArc(eventData) {
    const year = this._getYear();
    const daysInYear = this._getDaysInYear();

    // Parse event dates
    const startDate = new Date(eventData.startDate || eventData.date);
    const endDate = new Date(eventData.endDate || eventData.date);

    // Calculate day of year
    const startDay = LayoutCalculator.getDayOfYear(startDate);
    const endDay = LayoutCalculator.getDayOfYear(endDate);

    // Calculate angles
    const startAngle = (startDay - 1) / daysInYear * 2 * Math.PI - Math.PI / 2;
    const endAngle = endDay / daysInYear * 2 * Math.PI - Math.PI / 2;

    // Create arc path
    const arcPath = this._createArcPath(this.inner, this.outer, startAngle, endAngle);

    const eventId = eventData.id || Math.random().toString(36).substr(2, 9);
    const eventGroup = this._createSVGElement('g', {
      'class': 'event-arc',
      'data-event-id': eventId
    });

    // Event arc
    const arc = this._createSVGElement('path', {
      'd': arcPath,
      'fill': eventData.color || this.config.color,
      'stroke': 'rgba(255, 255, 255, 0.8)',
      'stroke-width': '1',
      'opacity': '0.85',
      'cursor': this.config.interactive ? 'pointer' : 'default'
    });

    eventGroup.appendChild(arc);

    // Add label if enabled
    if (this.config.showLabels && eventData.label) {
      this._addEventLabel(eventData, startAngle, endAngle, eventGroup);
    }

    // Add interactivity if enabled
    if (this.config.interactive && this.generalConfig.interactive) {
      this._addEventInteractivity(eventGroup, arc, eventData);
    }

    this.svgGroups.segments.appendChild(eventGroup);
    this.eventElements.push(eventGroup);

    // Mark day segments as having events
    for (let day = startDay; day <= endDay; day++) {
      const segments = this.svgGroups.rings.querySelectorAll(
        `[data-day="${day}"][data-year="${year}"]`
      );
      segments.forEach(seg => {
        seg.setAttribute('data-has-event', 'true');
      });
    }
  }

  /**
   * Add label to event arc (curved or radial based on aspect ratio)
   * @private
   */
  _addEventLabel(eventData, startAngle, endAngle, eventGroup) {
    const label = eventData.label || '';
    const midAngle = (startAngle + endAngle) / 2;
    const textRadius = this.center;

    // Calculate segment dimensions
    const ringHeight = this.outer - this.inner;
    const arcLength = Math.abs(endAngle - startAngle) * textRadius;

    // Decide orientation based on aspect ratio
    const useTangentialText = arcLength > ringHeight;

    const maxFontSize = this.config.fontSize;
    const minFontSize = Math.max(6, this.config.fontSize - 4);

    if (!useTangentialText) {
      // RADIAL TEXT (pointing outward from center)
      this._addRadialEventLabel(label, midAngle, textRadius, ringHeight, arcLength, eventGroup);
    } else {
      // CURVED TEXT (follows the arc)
      this._addCurvedEventLabel(label, midAngle, startAngle, endAngle, textRadius, arcLength, eventGroup);
    }
  }

  /**
   * Add radial event label
   * @private
   */
  _addRadialEventLabel(label, midAngle, textRadius, ringHeight, arcLength, eventGroup) {
    const point = this._polarToCartesian(textRadius, midAngle);
    let rotationAngle = (midAngle * 180 / Math.PI);

    // Keep text upright
    if (rotationAngle > 90 && rotationAngle < 270) {
      rotationAngle += 180;
    }

    // Font size based on ring height
    let fontSize = Math.min(this.config.fontSize, Math.max(6, ringHeight * 0.3));

    // Truncate based on arc length
    const charWidth = fontSize * 0.6;
    const maxChars = Math.floor(arcLength / charWidth);
    let displayLabel = this._truncateText(label, maxChars);

    // Only show if there's enough space
    if (arcLength > fontSize * 1.5 && maxChars >= 2) {
      const text = this._createSVGElement('text', {
        'x': point.x,
        'y': point.y,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-family': this.generalConfig.fontFamily,
        'font-size': fontSize,
        'font-weight': this.config.fontWeight,
        'fill': this.config.fontColor,
        'pointer-events': 'none',
        'transform': `rotate(${rotationAngle}, ${point.x}, ${point.y})`,
        'style': 'text-shadow: 0 1px 2px rgba(0,0,0,0.3);'
      });
      text.textContent = displayLabel;
      eventGroup.appendChild(text);
    }
  }

  /**
   * Add curved event label
   * @private
   */
  _addCurvedEventLabel(label, midAngle, startAngle, endAngle, textRadius, arcLength, eventGroup) {
    // Normalize angle for flip detection
    let normalizedAngle = midAngle;
    while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
    while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;

    // Flip text on bottom half
    const shouldFlipText = normalizedAngle > 0;

    const textPathId = `event-text-path-${Math.random().toString(36).substr(2, 9)}`;

    // Create arc path - reverse direction if flipped
    let textArcPath;
    if (shouldFlipText) {
      textArcPath = this._createCurvedTextPath(textRadius, endAngle, startAngle, true);
    } else {
      textArcPath = this._createCurvedTextPath(textRadius, startAngle, endAngle, false);
    }

    const path = this._createSVGElement('path', {
      'id': textPathId,
      'd': textArcPath,
      'fill': 'none'
    });
    this.defs.appendChild(path);
    this.eventElements.push(path);

    // Font size based on ring height
    const ringHeight = this.outer - this.inner;
    let fontSize = Math.min(this.config.fontSize, Math.max(6, ringHeight * 0.3));

    // Truncate based on arc length
    const estimatedCharWidth = fontSize * 0.6;
    const maxChars = Math.floor(arcLength / estimatedCharWidth);
    let displayLabel = this._truncateText(label, maxChars);

    if (maxChars >= 3) {
      const text = this._createSVGElement('text', {
        'font-family': this.generalConfig.fontFamily,
        'font-size': fontSize,
        'font-weight': this.config.fontWeight,
        'fill': this.config.fontColor,
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

  /**
   * Add interactivity to event
   * @private
   */
  _addEventInteractivity(eventGroup, arc, eventData) {
    eventGroup.addEventListener('mouseenter', () => {
      arc.setAttribute('opacity', '1');
      arc.setAttribute('stroke-width', '2');

      // Trigger callback if exists
      if (this.context.callbacks && this.context.callbacks.onSegmentHover) {
        this.context.callbacks.onSegmentHover(eventData);
      }
    });

    eventGroup.addEventListener('mouseleave', () => {
      arc.setAttribute('opacity', '0.85');
      arc.setAttribute('stroke-width', '1');
    });

    eventGroup.addEventListener('click', () => {
      // Trigger callback if exists
      if (this.context.callbacks && this.context.callbacks.onSegmentClick) {
        this.context.callbacks.onSegmentClick(eventData);
      }
    });
  }

  /**
   * Destroy ring and clean up
   */
  destroy() {
    this._clearEvents();
    super.destroy();
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = DataRing;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return DataRing;
  });
} else {
  window.DataRing = DataRing;
}
