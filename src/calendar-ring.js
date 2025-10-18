/**
 * CalendarRing - Renders calendar information (months, weeks, days, quarters)
 * Requires: constants.js, base-ring.js
 * @license MIT
 */

class CalendarRing extends BaseRing {
  constructor(config, boundaries, context) {
    super(config, boundaries, context);

    // Constants are already set by BaseRing, just add calendar-specific properties
    // Use constants for labels (fallback to hardcoded for backward compatibility)
    this.monthLabels = (this.TIME && this.TIME.MONTH_ABBR) || [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    this.quarterLabels = (this.TIME && this.TIME.QUARTER_LABELS) || ['Q1', 'Q2', 'Q3', 'Q4'];
  }

  /**
   * Calculate segment angles from day range
   * @param {number} startDay - Start day of year (1-based)
   * @param {number} endDay - End day of year (1-based)
   * @param {number} daysInYear - Total days in year
   * @returns {{startAngle: number, endAngle: number, midAngle: number}}
   * @private
   */
  _calculateSegmentAngles(startDay, endDay, daysInYear) {
    const angleOffset = this.GEOMETRY.ANGLE_OFFSET_TOP || -Math.PI / 2;
    const fullCircle = this.GEOMETRY.FULL_CIRCLE || 2 * Math.PI;

    const startAngle = ((startDay - 1) / daysInYear) * fullCircle + angleOffset;
    const endAngle = (endDay / daysInYear) * fullCircle + angleOffset;
    const midAngle = (startAngle + endAngle) / 2;

    return { startAngle, endAngle, midAngle };
  }

  /**
   * Render the calendar ring based on calendarType
   */
  render() {
    // Draw background
    this._drawRingBackground();

    // Render based on calendar type
    switch (this.config.calendarType) {
      case 'Month Names':
        this._renderMonthNames();
        break;
      case 'Week Numbers':
        this._renderWeekNumbers();
        break;
      case 'Day Numbers':
        this._renderDayNumbers();
        break;
      case 'Quarters':
        this._renderQuarters();
        break;
      default:
        console.warn(`Unknown calendar type: ${this.config.calendarType}`);
    }
  }

  /**
   * Render month names (12 segments)
   * @private
   */
  _renderMonthNames() {
    const year = this._getYear();
    const monthSegments = LayoutCalculator.getMonthSegments(year);
    const daysInYear = this._getDaysInYear();
    const labelRadius = this.center;
    const arcSpanRatio = this.GEOMETRY.LABEL_ARC_SPAN_MONTH || 0.8;

    monthSegments.forEach((monthData, index) => {
      const { month, startDay, endDay } = monthData;

      // Calculate angles for this month using helper
      const { startAngle, midAngle } = this._calculateSegmentAngles(startDay, endDay, daysInYear);
      const arcSpan = this._calculateSegmentAngles(startDay, endDay, daysInYear).endAngle - startAngle;

      // Draw separator at month boundary
      this._drawSeparator(startAngle);

      // Get month label with year on every month if enabled
      let monthLabel = this.monthLabels[month];
      if (this.config.showYear) {
        monthLabel += ` ${year}`;
      }

      // Add curved label
      this._addCurvedLabel(monthLabel, midAngle, arcSpan * arcSpanRatio, labelRadius);
    });
  }

  /**
   * Render week numbers (actual 7-day weeks)
   * @private
   */
  _renderWeekNumbers() {
    const year = this._getYear();
    const weekSegments = LayoutCalculator.getWeekSegments(year);
    const daysInYear = this._getDaysInYear();
    const labelRadius = this.center;
    const arcSpanRatio = this.GEOMETRY.LABEL_ARC_SPAN_WEEK || 0.7;
    const fontAdjustment = this.DIMENSIONS.CALENDAR_FONT_SIZE_ADJUSTMENT || 2;
    const minFontSize = this.DIMENSIONS.SMALL_FONT_SIZE || 7;

    // Render each week segment with actual 7-day duration
    weekSegments.forEach((weekData, index) => {
      const { week, startDay, endDay, days } = weekData;

      // Calculate angles for this week using helper
      const { startAngle, midAngle } = this._calculateSegmentAngles(startDay, endDay, daysInYear);
      const arcSpan = this._calculateSegmentAngles(startDay, endDay, daysInYear).endAngle - startAngle;

      // Draw separator at each week boundary
      this._drawSeparator(startAngle);

      // Add week number label for all weeks
      this._addCurvedLabel(
        String(week),
        midAngle,
        arcSpan * arcSpanRatio,
        labelRadius,
        { fontSize: Math.max(this.config.fontSize - fontAdjustment, minFontSize) }
      );
    });

    // Add year label if configured
    if (this.config.showYear) {
      const topAngle = this.GEOMETRY.ANGLE_OFFSET_TOP || -Math.PI / 2;
      const yearLabelArcSpan = this.GEOMETRY.QUARTER_CIRCLE / 3; // Math.PI / 6
      this._addCurvedLabel(
        String(year),
        topAngle,
        yearLabelArcSpan,
        labelRadius,
        { fontSize: this.config.fontSize + fontAdjustment, fontWeight: '700' }
      );
    }
  }

  /**
   * Render day numbers (365 segments, sparse labels)
   * @private
   */
  _renderDayNumbers() {
    const year = this._getYear();
    const daysInYear = this._getDaysInYear();
    const labelRadius = this.center;
    const arcSpanRatio = this.GEOMETRY.LABEL_ARC_SPAN_DAY || 0.6;
    const minDayInterval = this.DIMENSIONS.MIN_DAY_LABEL_INTERVAL || 5;
    const maxDayLabels = this.DIMENSIONS.MAX_DAY_LABELS || 36;
    const minFontSize = this.DIMENSIONS.SMALL_FONT_SIZE || 7;
    const fontAdjustment = this.DIMENSIONS.CALENDAR_FONT_SIZE_ADJUSTMENT || 2;

    // Show day labels every N days to avoid crowding
    const labelInterval = Math.max(minDayInterval, Math.floor(daysInYear / maxDayLabels));

    for (let day = 1; day <= daysInYear; day++) {
      // Calculate angles for this day using helper
      const { startAngle, midAngle } = this._calculateSegmentAngles(day, day, daysInYear);
      const arcSpan = this._calculateSegmentAngles(day, day, daysInYear).endAngle - startAngle;

      // Draw separator at each day boundary
      this._drawSeparator(startAngle);

      // Add day label at intervals
      if (day % labelInterval === 0 || day === 1) {
        this._addCurvedLabel(
          String(day),
          midAngle,
          arcSpan * labelInterval * arcSpanRatio,
          labelRadius,
          { fontSize: Math.max(this.config.fontSize - (fontAdjustment / 2), minFontSize) }
        );
      }
    }

    // Add year label if configured
    if (this.config.showYear) {
      const topAngle = this.GEOMETRY.ANGLE_OFFSET_TOP || -Math.PI / 2;
      const yearLabelArcSpan = this.GEOMETRY.QUARTER_CIRCLE / 3; // Math.PI / 6
      this._addCurvedLabel(
        String(year),
        topAngle,
        yearLabelArcSpan,
        labelRadius,
        { fontSize: this.config.fontSize + fontAdjustment, fontWeight: '700' }
      );
    }
  }

  /**
   * Render quarters (4 segments)
   * @private
   */
  _renderQuarters() {
    const year = this._getYear();
    const quarterSegments = LayoutCalculator.getQuarterSegments(year);
    const daysInYear = this._getDaysInYear();
    const labelRadius = this.center;
    const arcSpanRatio = this.GEOMETRY.LABEL_ARC_SPAN_DAY || 0.6; // Quarters use same ratio as days
    const fontAdjustment = this.DIMENSIONS.CALENDAR_FONT_SIZE_ADJUSTMENT || 2;

    quarterSegments.forEach((quarterData, index) => {
      const { quarter, startDay, endDay } = quarterData;

      // Calculate angles for this quarter using helper
      const { startAngle, midAngle } = this._calculateSegmentAngles(startDay, endDay, daysInYear);
      const arcSpan = this._calculateSegmentAngles(startDay, endDay, daysInYear).endAngle - startAngle;

      // Draw separator at quarter boundary
      this._drawSeparator(startAngle);

      // Get quarter label
      let quarterLabel = this.quarterLabels[index];
      if (this.config.showYear && (quarter === 1 || quarter === 4)) {
        quarterLabel += ` ${year}`;
      }

      // Add curved label (larger font for quarters)
      this._addCurvedLabel(
        quarterLabel,
        midAngle,
        arcSpan * arcSpanRatio,
        labelRadius,
        {
          fontSize: this.config.fontSize + fontAdjustment,
          fontWeight: '700'
        }
      );

      // Add month indicators within each quarter (optional, more subtle)
      if (this.config.showMonthsInQuarters !== false) {
        quarterData.months.forEach(monthIndex => {
          const monthSegments = LayoutCalculator.getMonthSegments(year);
          const monthData = monthSegments[monthIndex];
          const monthAngles = this._calculateSegmentAngles(monthData.startDay, monthData.endDay, daysInYear);

          // Draw lighter separator for months within quarters
          if (monthIndex !== quarterData.months[0]) {
            const innerPoint = this._polarToCartesian(this.inner, monthAngles.startAngle);
            const outerPoint = this._polarToCartesian(this.outer, monthAngles.startAngle);

            const separatorOpacity = this.STYLING.CALENDAR_SEPARATOR_OPACITY || 0.15;
            const separatorStroke = this.STYLING.CALENDAR_SEPARATOR_STROKE || 0.5;
            const separatorDash = this.STYLING.CALENDAR_SEPARATOR_DASH || '2,2';

            const separator = this._createSVGElement('line', {
              'x1': innerPoint.x,
              'y1': innerPoint.y,
              'x2': outerPoint.x,
              'y2': outerPoint.y,
              'stroke': `rgba(255, 255, 255, ${separatorOpacity})`,
              'stroke-width': String(separatorStroke),
              'stroke-dasharray': separatorDash,
              'class': 'month-separator'
            });

            this.svgGroups.rings.appendChild(separator);
            this.elements.push(separator);
          }
        });
      }
    });
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CalendarRing;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return CalendarRing;
  });
} else {
  window.CalendarRing = CalendarRing;
}
