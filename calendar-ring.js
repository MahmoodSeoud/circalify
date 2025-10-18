/**
 * CalendarRing - Renders calendar information (months, weeks, days, quarters)
 * @license MIT
 */

class CalendarRing extends BaseRing {
  constructor(config, boundaries, context) {
    super(config, boundaries, context);

    this.monthLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    this.quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
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

    monthSegments.forEach((monthData, index) => {
      const { month, startDay, endDay } = monthData;

      // Calculate angles for this month
      const startAngle = ((startDay - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endDay / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const centerAngle = (startAngle + endAngle) / 2;
      const arcSpan = endAngle - startAngle;

      // Draw separator at month boundary
      this._drawSeparator(startAngle);

      // Get month label
      let monthLabel = this.monthLabels[month];
      if (this.config.showYear && (month === 0 || month === 11)) {
        monthLabel += ` ${year}`;
      }

      // Add curved label
      this._addCurvedLabel(monthLabel, centerAngle, arcSpan * 0.8, labelRadius);
    });
  }

  /**
   * Render week numbers (52 segments)
   * @private
   */
  _renderWeekNumbers() {
    const year = this._getYear();
    const daysInYear = this._getDaysInYear();
    const totalWeeks = 52;
    const labelRadius = this.center;

    // Create 52 week segments
    for (let week = 1; week <= totalWeeks; week++) {
      const startDay = (week - 1) * 7 + 1;
      const endDay = Math.min(week * 7, daysInYear);

      const startAngle = ((startDay - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endDay / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const centerAngle = (startAngle + endAngle) / 2;
      const arcSpan = endAngle - startAngle;

      // Draw separator every 4 weeks (monthly markers)
      if (week % 4 === 1) {
        this._drawSeparator(startAngle);
      }

      // Add week number label (show every other week to avoid crowding)
      if (week % 2 === 1 || totalWeeks <= 26) {
        this._addCurvedLabel(
          String(week),
          centerAngle,
          arcSpan * 0.7,
          labelRadius,
          { fontSize: Math.max(this.config.fontSize - 2, 7) }
        );
      }
    }

    // Add year label if configured
    if (this.config.showYear) {
      const topAngle = -Math.PI / 2;
      this._addCurvedLabel(
        String(year),
        topAngle,
        Math.PI / 6,
        labelRadius,
        { fontSize: this.config.fontSize + 2, fontWeight: '700' }
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

    // Show day labels every N days to avoid crowding
    const labelInterval = Math.max(5, Math.floor(daysInYear / 36)); // ~36 labels max

    for (let day = 1; day <= daysInYear; day++) {
      const startAngle = ((day - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (day / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const centerAngle = (startAngle + endAngle) / 2;
      const arcSpan = endAngle - startAngle;

      // Draw separator every 10 days
      if (day % 10 === 1) {
        this._drawSeparator(startAngle);
      }

      // Add day label at intervals
      if (day % labelInterval === 0 || day === 1) {
        this._addCurvedLabel(
          String(day),
          centerAngle,
          arcSpan * labelInterval * 0.6,
          labelRadius,
          { fontSize: Math.max(this.config.fontSize - 1, 7) }
        );
      }
    }

    // Add year label if configured
    if (this.config.showYear) {
      const topAngle = -Math.PI / 2;
      this._addCurvedLabel(
        String(year),
        topAngle,
        Math.PI / 6,
        labelRadius,
        { fontSize: this.config.fontSize + 2, fontWeight: '700' }
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

    quarterSegments.forEach((quarterData, index) => {
      const { quarter, startDay, endDay } = quarterData;

      // Calculate angles for this quarter
      const startAngle = ((startDay - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endDay / daysInYear) * 2 * Math.PI - Math.PI / 2;
      const centerAngle = (startAngle + endAngle) / 2;
      const arcSpan = endAngle - startAngle;

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
        centerAngle,
        arcSpan * 0.6,
        labelRadius,
        {
          fontSize: this.config.fontSize + 2,
          fontWeight: '700'
        }
      );

      // Add month indicators within each quarter
      quarterData.months.forEach(monthIndex => {
        const monthSegments = LayoutCalculator.getMonthSegments(year);
        const monthData = monthSegments[monthIndex];
        const monthStartAngle = ((monthData.startDay - 1) / daysInYear) * 2 * Math.PI - Math.PI / 2;

        // Draw lighter separator for months within quarters
        if (monthIndex !== quarterData.months[0]) {
          const innerPoint = this._polarToCartesian(this.inner, monthStartAngle);
          const outerPoint = this._polarToCartesian(this.outer, monthStartAngle);

          const separator = this._createSVGElement('line', {
            'x1': innerPoint.x,
            'y1': innerPoint.y,
            'x2': outerPoint.x,
            'y2': outerPoint.y,
            'stroke': 'rgba(255, 255, 255, 0.3)',
            'stroke-width': '1',
            'stroke-dasharray': '3,3',
            'class': 'month-separator'
          });

          this.svgGroups.rings.appendChild(separator);
          this.elements.push(separator);
        }
      });
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
