/**
 * RingFactory - Creates ring instances based on configuration
 * @license MIT
 */

import CalendarRing from './calendar-ring.js';
import HeaderRing from './header-ring.js';
import DataRing from './data-ring.js';

class RingFactory {
  /**
   * Create a ring instance based on type
   * @param {Object} config - Ring configuration
   * @param {Object} boundaries - Ring boundaries {inner, outer, center}
   * @param {Object} context - Shared context
   * @returns {BaseRing} Ring instance
   */
  static createRing(config, boundaries, context) {
    if (!config || !config.type) {
      throw new Error('RingFactory: config must have a type property');
    }

    const type = config.type.toLowerCase();

    switch (type) {
      case 'calendar':
        return new CalendarRing(config, boundaries, context);

      case 'header':
        return new HeaderRing(config, boundaries, context);

      case 'data':
        return new DataRing(config, boundaries, context);

      default:
        throw new Error(`RingFactory: Unknown ring type '${type}'`);
    }
  }

  /**
   * Create multiple rings from configurations array
   * @param {Array} ringConfigs - Array of ring configurations
   * @param {Array} boundaries - Array of ring boundaries
   * @param {Object} context - Shared context
   * @returns {Array} Array of ring instances
   */
  static createRings(ringConfigs, boundaries, context) {
    if (!Array.isArray(ringConfigs) || !Array.isArray(boundaries)) {
      throw new Error('RingFactory: ringConfigs and boundaries must be arrays');
    }

    if (ringConfigs.length !== boundaries.length) {
      throw new Error(
        `RingFactory: ringConfigs (${ringConfigs.length}) and boundaries (${boundaries.length}) length mismatch`
      );
    }

    return ringConfigs.map((config, index) => {
      return this.createRing(config, boundaries[index], context);
    });
  }

  /**
   * Get available ring types
   * @returns {Array} Array of available ring type names
   */
  static getAvailableTypes() {
    return ['calendar', 'header', 'data'];
  }

  /**
   * Check if a ring type is valid
   * @param {string} type - Ring type to check
   * @returns {boolean} True if valid
   */
  static isValidType(type) {
    return this.getAvailableTypes().includes(type.toLowerCase());
  }
}

// Export for ES6 modules
export default RingFactory;

// Also make available globally for browser compatibility
if (typeof window !== 'undefined') {
  window.RingFactory = RingFactory;
}
