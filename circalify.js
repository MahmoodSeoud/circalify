/**
 * Circalify - Flexible Ring-Based Annual Wheel Visualization
 * Complete bundle with all modules
 * @license MIT
 */

// This file serves as the bundled entry point
// In development, load individual modules in order
// In production, use a bundler to combine these

// Note: When using this directly in HTML, you need to load the modules in the correct order:
// 1. layout-calculator.js
// 2. config-parser.js
// 3. base-ring.js
// 4. calendar-ring.js
// 5. header-ring.js
// 6. data-ring.js
// 7. ring-factory.js
// 8. circalify-core.js
// 9. circalify.js (this file)

/**
 * AnnualWheel - Main API class
 *
 * @example
 * const config = {
 *   title: "My Annual Wheel",
 *   startYear: 2025,
 *   startMonth: 0,
 *   numberOfMonths: 12,
 *   sameRingHeight: false,
 *   rings: [
 *     {
 *       type: "calendar",
 *       calendarType: "Month Names",
 *       showYear: true,
 *       color: "#CCCCCC",
 *       height: 15,
 *       separator: true,
 *       fontSize: 11,
 *       fontColor: "#333"
 *     },
 *     {
 *       type: "header",
 *       headerText: "Board Meetings 2025",
 *       cells: 12,
 *       color: "#4ECDC4",
 *       height: 10,
 *       fontSize: 10,
 *       fontColor: "#FFF"
 *     },
 *     {
 *       type: "data",
 *       name: "Events",
 *       color: "#FF6B6B",
 *       unit: "day",
 *       height: 20,
 *       fontSize: 10,
 *       fontColor: "#000"
 *     }
 *   ]
 * };
 *
 * const wheel = new AnnualWheel('#container', config);
 * wheel.setData(events);
 */
class AnnualWheel {
  /**
   * Create an AnnualWheel instance
   * @param {HTMLElement|string} container - Container element or selector
   * @param {Object} config - Configuration object
   */
  constructor(container, config = {}) {
    // Handle string selector
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`AnnualWheel: Container not found: ${container}`);
      }
      container = element;
    }

    // Create core instance
    this.core = new CircalifyCore(container, config);
  }

  /**
   * Update data for DataRings
   * @param {Array} data - Event data array
   * @param {string} ringName - Optional: target specific ring by name
   * @returns {AnnualWheel} this for chaining
   */
  setData(data, ringName = null) {
    this.core.update(data, ringName);
    return this;
  }

  /**
   * Get all ring instances
   * @returns {Array} Array of ring instances
   */
  getRings() {
    return this.core.rings;
  }

  /**
   * Get a specific ring by name
   * @param {string} name - Ring name
   * @returns {BaseRing|null} Ring instance or null
   */
  getRing(name) {
    return this.core.rings.find(ring =>
      ring.config.name === name ||
      ring.config.headerText === name ||
      ring.config.calendarType === name
    ) || null;
  }

  /**
   * Get all DataRings
   * @returns {Array} Array of DataRing instances
   */
  getDataRings() {
    return this.core.rings.filter(ring => ring instanceof DataRing);
  }

  /**
   * Get configuration
   * @returns {Object} Parsed configuration
   */
  getConfig() {
    return {
      general: this.core.generalConfig,
      rings: this.core.ringConfigs
    };
  }

  /**
   * Destroy the visualization
   */
  destroy() {
    this.core.destroy();
  }

  /**
   * Get version
   * @returns {string} Version number
   */
  static get version() {
    return '2.0.0';
  }

  /**
   * Get available ring types
   * @returns {Array} Array of ring type names
   */
  static getAvailableRingTypes() {
    return RingFactory.getAvailableTypes();
  }

  /**
   * Get available calendar types
   * @returns {Array} Array of calendar type names
   */
  static getAvailableCalendarTypes() {
    return ['Month Names', 'Week Numbers', 'Day Numbers', 'Quarters'];
  }
}

// Keep backward compatibility with Circalify name
const Circalify = AnnualWheel;

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = AnnualWheel;
  module.exports.Circalify = Circalify;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return AnnualWheel;
  });
} else {
  window.AnnualWheel = AnnualWheel;
  window.Circalify = Circalify; // Backward compatibility
}
