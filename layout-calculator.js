/**
 * LayoutCalculator - Calculates ring dimensions and positions
 * @license MIT
 *
 * Requires: constants.js
 */

class LayoutCalculator {
  // Destructure constants for cleaner code
  static {
    const { GEOMETRY, TIME } = window.CIRCALIFY_CONSTANTS || {};
    if (GEOMETRY && TIME) {
      this.FULL_CIRCLE = GEOMETRY.FULL_CIRCLE;
      this.HALF_CIRCLE = GEOMETRY.HALF_CIRCLE;
      this.ANGLE_OFFSET_TOP = GEOMETRY.ANGLE_OFFSET_TOP;
      this.MS_PER_DAY = TIME.MS_PER_DAY;
      this.DAYS_PER_WEEK = TIME.DAYS_PER_WEEK;
      this.MONTHS_PER_YEAR = TIME.MONTHS_PER_YEAR;
      this.MONTHS_PER_QUARTER = TIME.MONTHS_PER_QUARTER;
      this.QUARTERS_PER_YEAR = TIME.QUARTERS_PER_YEAR;
      this.ISO_WEEK_THURSDAY_OFFSET = TIME.ISO_WEEK_THURSDAY_OFFSET;
      this.DAYS_PER_MONTH = TIME.DAYS_PER_MONTH;
    }
  }
  /**
   * Calculate ring boundaries for all rings
   * @param {Array} rings - Array of ring configurations
   * @param {number} innerRadius - Innermost radius (center circle)
   * @param {number} outerRadius - Outermost radius
   * @param {boolean} sameRingHeight - Whether all rings should have equal height
   * @returns {Array} Array of boundary objects {inner, outer, center, ring, index}
   */
  static calculateRingBoundaries(rings, innerRadius, outerRadius, sameRingHeight = true) {
    if (!Array.isArray(rings) || rings.length === 0) {
      throw new Error('LayoutCalculator: rings must be a non-empty array');
    }

    if (innerRadius >= outerRadius) {
      throw new Error('LayoutCalculator: innerRadius must be less than outerRadius');
    }

    // Filter only active rings
    const activeRings = rings.filter(r => r.active);
    if (activeRings.length === 0) {
      throw new Error('LayoutCalculator: At least one ring must be active');
    }

    const availableSpace = outerRadius - innerRadius;
    const boundaries = [];

    if (sameRingHeight) {
      // Equal height for all rings
      const ringHeight = availableSpace / activeRings.length;
      let currentInner = innerRadius;

      activeRings.forEach((ring, i) => {
        const inner = currentInner;
        const outer = currentInner + ringHeight;
        const center = (inner + outer) / 2;

        boundaries.push({
          inner,
          outer,
          center,
          ring,
          index: i,
          originalIndex: ring.index,
          height: ringHeight
        });

        currentInner = outer;
      });
    } else {
      // Proportional height based on ring.height values
      const totalHeightUnits = activeRings.reduce((sum, ring) => sum + ring.height, 0);
      const unitSize = availableSpace / totalHeightUnits;
      let currentInner = innerRadius;

      activeRings.forEach((ring, i) => {
        const ringHeight = ring.height * unitSize;
        const inner = currentInner;
        const outer = currentInner + ringHeight;
        const center = (inner + outer) / 2;

        boundaries.push({
          inner,
          outer,
          center,
          ring,
          index: i,
          originalIndex: ring.index,
          height: ringHeight
        });

        currentInner = outer;
      });
    }

    return boundaries;
  }

  /**
   * Calculate center coordinates
   * @param {number} outerRadius - Outermost radius
   * @param {number} viewBoxPadding - Padding around the visualization
   * @returns {Object} {cx, cy, viewBoxSize}
   */
  static calculateCenter(outerRadius, viewBoxPadding) {
    const cx = outerRadius + viewBoxPadding;
    const cy = outerRadius + viewBoxPadding;
    const viewBoxSize = (outerRadius + viewBoxPadding) * 2;

    return { cx, cy, viewBoxSize };
  }

  /**
   * Calculate angle for a specific date
   * @param {Date} date - Date object
   * @param {number} startYear - Year to start from
   * @param {number} startMonth - Month to start from (0-11)
   * @param {number} numberOfMonths - Number of months to display
   * @returns {number} Angle in radians (-PI/2 offset for top start)
   */
  static calculateDateAngle(date, startYear, startMonth, numberOfMonths) {
    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(startYear, startMonth + numberOfMonths, 0); // Last day of period

    // Calculate total days in the period
    const totalDays = Math.ceil((endDate - startDate) / this.MS_PER_DAY);

    // Calculate day offset from start
    const dayOffset = Math.floor((date - startDate) / this.MS_PER_DAY);

    // Calculate angle (0 = top, clockwise)
    const angle = (dayOffset / totalDays) * this.FULL_CIRCLE + this.ANGLE_OFFSET_TOP;

    return angle;
  }

  /**
   * Calculate day of year
   * @param {Date} date - Date object
   * @returns {number} Day of year (1-365/366)
   */
  static getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    const day = Math.floor(diff / this.MS_PER_DAY) + 1;
    return day;
  }

  /**
   * Calculate week number of year (ISO week)
   * @param {Date} date - Date object
   * @returns {number} Week number (1-52/53)
   */
  static getWeekOfYear(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || this.DAYS_PER_WEEK;
    d.setUTCDate(d.getUTCDate() + this.ISO_WEEK_THURSDAY_OFFSET - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d - yearStart) / this.MS_PER_DAY) + 1) / this.DAYS_PER_WEEK);
    return weekNumber;
  }

  /**
   * Calculate month segments for a year
   * @param {number} year - Year
   * @returns {Array} Array of {month, startDay, endDay, days}
   */
  static getMonthSegments(year) {
    const segments = [];
    const monthDays = [...this.DAYS_PER_MONTH];
    // Adjust February for leap years
    monthDays[1] = this.isLeapYear(year) ? 29 : 28;
    let dayOfYear = 0;

    for (let month = 0; month < this.MONTHS_PER_YEAR; month++) {
      const days = monthDays[month];
      segments.push({
        month,
        startDay: dayOfYear + 1,
        endDay: dayOfYear + days,
        days
      });
      dayOfYear += days;
    }

    return segments;
  }

  /**
   * Calculate week segments for a year (actual 7-day weeks)
   * @param {number} year - Year
   * @returns {Array} Array of {week, startDay, endDay, days}
   */
  static getWeekSegments(year) {
    const segments = [];
    const daysInYear = this.getDaysInYear(year);
    const totalWeeks = Math.floor(daysInYear / this.DAYS_PER_WEEK);
    let currentDay = 1;

    // Create complete 7-day weeks
    for (let week = 1; week <= totalWeeks; week++) {
      segments.push({
        week,
        startDay: currentDay,
        endDay: currentDay + this.DAYS_PER_WEEK - 1,
        days: this.DAYS_PER_WEEK
      });
      currentDay += this.DAYS_PER_WEEK;
    }

    // Add remaining days as a partial week (if any)
    const remainingDays = daysInYear - (totalWeeks * this.DAYS_PER_WEEK);
    if (remainingDays > 0) {
      segments.push({
        week: totalWeeks + 1,
        startDay: currentDay,
        endDay: daysInYear,
        days: remainingDays
      });
    }

    return segments;
  }

  /**
   * Calculate quarter segments for a year
   * @param {number} year - Year
   * @returns {Array} Array of {quarter, startDay, endDay, days, months}
   */
  static getQuarterSegments(year) {
    const monthSegments = this.getMonthSegments(year);
    const quarters = [];

    for (let q = 0; q < this.QUARTERS_PER_YEAR; q++) {
      const startMonth = q * this.MONTHS_PER_QUARTER;
      const endMonth = startMonth + this.MONTHS_PER_QUARTER - 1;
      const startDay = monthSegments[startMonth].startDay;
      const endDay = monthSegments[endMonth].endDay;
      const days = endDay - startDay + 1;

      quarters.push({
        quarter: q + 1,
        startDay,
        endDay,
        days,
        months: [startMonth, startMonth + 1, startMonth + 2]
      });
    }

    return quarters;
  }

  /**
   * Check if year is a leap year
   * @param {number} year - Year
   * @returns {boolean} True if leap year
   */
  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Calculate total days in a year
   * @param {number} year - Year
   * @returns {number} 365 or 366
   */
  static getDaysInYear(year) {
    return this.isLeapYear(year) ? 366 : 365;
  }

  /**
   * Convert polar coordinates to cartesian
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} radius - Radius
   * @param {number} angle - Angle in radians
   * @returns {Object} {x, y}
   */
  static polarToCartesian(cx, cy, radius, angle) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  }

  /**
   * Create an arc path string for SVG
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} innerRadius - Inner radius
   * @param {number} outerRadius - Outer radius
   * @param {number} startAngle - Start angle in radians
   * @param {number} endAngle - End angle in radians
   * @returns {string} SVG path string
   */
  static createArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
    const innerStart = this.polarToCartesian(cx, cy, innerRadius, startAngle);
    const innerEnd = this.polarToCartesian(cx, cy, innerRadius, endAngle);
    const outerStart = this.polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = this.polarToCartesian(cx, cy, outerRadius, endAngle);

    const largeArc = (endAngle - startAngle) > this.HALF_CIRCLE ? 1 : 0;

    return [
      `M ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
      `L ${outerEnd.x} ${outerEnd.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerStart.x} ${outerStart.y}`,
      'Z'
    ].join(' ');
  }

  /**
   * Create a donut (full circle ring) path
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} innerRadius - Inner radius
   * @param {number} outerRadius - Outer radius
   * @returns {string} SVG path string
   */
  static createDonutPath(cx, cy, innerRadius, outerRadius) {
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
}

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = LayoutCalculator;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return LayoutCalculator;
  });
} else {
  window.LayoutCalculator = LayoutCalculator;
}
