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
   * Draw segments based on the unit (day/week/month/quarter)
   * @private
   */
  _drawDaySegments() {
    const unit = this.config.unit || 'day';

    switch(unit.toLowerCase()) {
      case 'week':
        this._drawWeekSegments();
        break;
      case 'month':
        this._drawMonthSegments();
        break;
      case 'quarter':
        this._drawQuarterSegments();
        break;
      case 'day':
      default:
        this._drawIndividualDaySegments();
        break;
    }
  }

  /**
   * Draw individual day segments (365 segments)
   * @private
   */
  _drawIndividualDaySegments() {
    const daysInYear = this._getDaysInYear();
    const year = this._getYear();

    for (let day = 1; day <= daysInYear; day++) {
      const startAngle = ((day - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (day / daysInYear) * 2 * Math.PI - Math.PI / 2;

      this._createSegment(startAngle, endAngle, {
        'data-day': day,
        'data-year': year,
        'data-unit': 'day'
      });
    }
  }

  /**
   * Draw week segments (actual 7-day weeks)
   * @private
   */
  _drawWeekSegments() {
    const year = this._getYear();
    const daysInYear = this._getDaysInYear();
    const weekSegments = LayoutCalculator.getWeekSegments(year);

    weekSegments.forEach(weekData => {
      const { week, startDay, endDay } = weekData;
      const startAngle = ((startDay - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endDay / daysInYear) * 2 * Math.PI - Math.PI / 2;

      this._createSegment(startAngle, endAngle, {
        'data-week': week,
        'data-start-day': startDay,
        'data-end-day': endDay,
        'data-year': year,
        'data-unit': 'week'
      });
    });
  }

  /**
   * Draw month segments (actual days in each month)
   * @private
   */
  _drawMonthSegments() {
    const year = this._getYear();
    const daysInYear = this._getDaysInYear();
    const monthSegments = LayoutCalculator.getMonthSegments(year);

    monthSegments.forEach(monthData => {
      const { month, startDay, endDay } = monthData;
      const startAngle = ((startDay - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endDay / daysInYear) * 2 * Math.PI - Math.PI / 2;

      this._createSegment(startAngle, endAngle, {
        'data-month': month,
        'data-start-day': startDay,
        'data-end-day': endDay,
        'data-year': year,
        'data-unit': 'month'
      });
    });
  }

  /**
   * Draw quarter segments (actual days in each quarter)
   * @private
   */
  _drawQuarterSegments() {
    const year = this._getYear();
    const daysInYear = this._getDaysInYear();
    const quarterSegments = LayoutCalculator.getQuarterSegments(year);

    quarterSegments.forEach(quarterData => {
      const { quarter, startDay, endDay } = quarterData;
      const startAngle = ((startDay - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endDay / daysInYear) * 2 * Math.PI - Math.PI / 2;

      this._createSegment(startAngle, endAngle, {
        'data-quarter': quarter,
        'data-start-day': startDay,
        'data-end-day': endDay,
        'data-year': year,
        'data-unit': 'quarter'
      });
    });
  }

  /**
   * Create a single clickable segment
   * @private
   */
  _createSegment(startAngle, endAngle, attributes = {}, drawSeparator = true) {
    const segmentPath = this._createArcPath(
      this.inner,
      this.outer,
      startAngle,
      endAngle
    );

    const segment = this._createSVGElement('path', {
      'd': segmentPath,
      'fill': 'transparent',
      'stroke': 'rgba(255, 255, 255, 0.1)',
      'stroke-width': '0.5',
      'class': 'unit-segment',
      'cursor': 'pointer',
      ...attributes
    });

    // Add hover interaction if enabled
    if (this.config.interactive !== false) {
      segment.addEventListener('mouseenter', () => {
        segment.setAttribute('fill', 'rgba(0, 0, 0, 0.05)');
      });

      segment.addEventListener('mouseleave', () => {
        segment.setAttribute('fill', 'transparent');
      });
    }

    this.svgGroups.rings.appendChild(segment);
    this.elements.push(segment);

    // Draw separator line at the start of this segment if enabled
    if (drawSeparator && this.config.separator !== false) {
      this._drawUnitSeparator(startAngle);
    }
  }

  /**
   * Draw a separator line at a specific angle
   * @private
   */
  _drawUnitSeparator(angle) {
    const innerPoint = this._polarToCartesian(this.inner, angle);
    const outerPoint = this._polarToCartesian(this.outer, angle);

    const separator = this._createSVGElement('line', {
      'x1': innerPoint.x,
      'y1': innerPoint.y,
      'x2': outerPoint.x,
      'y2': outerPoint.y,
      'stroke': 'rgba(255, 255, 255, 0.8)',
      'stroke-width': '1.5',
      'class': 'unit-separator'
    });

    this.svgGroups.rings.appendChild(separator);
    this.elements.push(separator);
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
   * Render a single event arc - expands to fill entire unit segments
   * @private
   */
  _renderEventArc(eventData) {
    const year = this._getYear();
    const daysInYear = this._getDaysInYear();
    const unit = this.config.unit || 'day';

    // Parse event dates
    const startDate = new Date(eventData.startDate || eventData.date);
    const endDate = new Date(eventData.endDate || eventData.date);

    // Calculate day of year
    const eventStartDay = LayoutCalculator.getDayOfYear(startDate);
    const eventEndDay = LayoutCalculator.getDayOfYear(endDate);

    // Expand to fill entire unit segments
    const { startDay, endDay } = this._expandToUnitBoundaries(eventStartDay, eventEndDay, unit, year);

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

    // Mark segments as having events
    this._markSegmentsWithEvent(startDay, endDay, year);
  }

  /**
   * Expand event to fill entire unit segment boundaries
   * @private
   */
  _expandToUnitBoundaries(eventStartDay, eventEndDay, unit, year) {
    let startDay = eventStartDay;
    let endDay = eventEndDay;

    switch(unit.toLowerCase()) {
      case 'week':
        const weekSegments = LayoutCalculator.getWeekSegments(year);
        // Find all weeks that the event touches
        const affectedWeeks = weekSegments.filter(week =>
          week.startDay <= eventEndDay && week.endDay >= eventStartDay
        );
        if (affectedWeeks.length > 0) {
          startDay = affectedWeeks[0].startDay;
          endDay = affectedWeeks[affectedWeeks.length - 1].endDay;
        }
        break;

      case 'month':
        const monthSegments = LayoutCalculator.getMonthSegments(year);
        // Find all months that the event touches
        const affectedMonths = monthSegments.filter(month =>
          month.startDay <= eventEndDay && month.endDay >= eventStartDay
        );
        if (affectedMonths.length > 0) {
          startDay = affectedMonths[0].startDay;
          endDay = affectedMonths[affectedMonths.length - 1].endDay;
        }
        break;

      case 'quarter':
        const quarterSegments = LayoutCalculator.getQuarterSegments(year);
        // Find all quarters that the event touches
        const affectedQuarters = quarterSegments.filter(quarter =>
          quarter.startDay <= eventEndDay && quarter.endDay >= eventStartDay
        );
        if (affectedQuarters.length > 0) {
          startDay = affectedQuarters[0].startDay;
          endDay = affectedQuarters[affectedQuarters.length - 1].endDay;
        }
        break;

      case 'day':
      default:
        // No expansion needed for day unit
        break;
    }

    return { startDay, endDay };
  }

  /**
   * Mark segments that contain events
   * @private
   */
  _markSegmentsWithEvent(startDay, endDay, year) {
    const unit = this.config.unit || 'day';

    // Get all segments in this ring
    const allSegments = this.svgGroups.rings.querySelectorAll('.unit-segment');

    allSegments.forEach(segment => {
      const segmentStartDay = parseInt(segment.getAttribute('data-start-day') || segment.getAttribute('data-day') || '0');
      const segmentEndDay = parseInt(segment.getAttribute('data-end-day') || segment.getAttribute('data-day') || '0');

      // Check if this segment overlaps with the event date range
      if (segmentStartDay <= endDay && segmentEndDay >= startDay) {
        segment.setAttribute('data-has-event', 'true');
      }
    });
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
        'style': 'text-shadow: 0 1px 2px rgba(0,0,0,0.3); user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;'
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
        'style': 'text-shadow: 0 1px 2px rgba(0,0,0,0.3); user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;'
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
