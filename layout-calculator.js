/**
 * LayoutCalculator - Calculates ring dimensions and positions
 * @license MIT
 */

class LayoutCalculator {
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
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Calculate day offset from start
    const dayOffset = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));

    // Calculate angle (0 = top, clockwise)
    const angle = (dayOffset / totalDays) * 2 * Math.PI - Math.PI / 2;

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
    const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    return day;
  }

  /**
   * Calculate week number of year (ISO week)
   * @param {Date} date - Date object
   * @returns {number} Week number (1-52/53)
   */
  static getWeekOfYear(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }

  /**
   * Calculate month segments for a year
   * @param {number} year - Year
   * @returns {Array} Array of {month, startDay, endDay, days}
   */
  static getMonthSegments(year) {
    const segments = [];
    const monthDays = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = 0;

    for (let month = 0; month < 12; month++) {
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
    const totalWeeks = Math.floor(daysInYear / 7); // Number of complete 7-day weeks
    let currentDay = 1;

    // Create complete 7-day weeks
    for (let week = 1; week <= totalWeeks; week++) {
      segments.push({
        week,
        startDay: currentDay,
        endDay: currentDay + 6,
        days: 7
      });
      currentDay += 7;
    }

    // Add remaining days as a partial week (if any)
    const remainingDays = daysInYear - (totalWeeks * 7);
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

    for (let q = 0; q < 4; q++) {
      const startMonth = q * 3;
      const endMonth = startMonth + 2;
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

    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;

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
