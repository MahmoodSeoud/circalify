/**
 * ConfigParser - Validates and parses Circalify configuration
 * @license MIT
 */

class ConfigParser {
  constructor() {
    this.validRingTypes = ['calendar', 'header', 'data'];
    this.validCalendarTypes = ['Month Names', 'Week Numbers', 'Day Numbers', 'Quarters'];
    this.validTimeUnits = ['day', 'week', 'month', 'quarter', 'year'];
  }

  /**
   * Parse and validate complete configuration
   * @param {Object} config - Raw configuration object
   * @returns {Object} Validated and structured configuration
   */
  parse(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('ConfigParser: Configuration must be an object');
    }

    const parsed = {
      general: this._parseGeneralSettings(config),
      rings: this._parseRings(config.rings || [])
    };

    // Validate at least one active ring
    const activeRings = parsed.rings.filter(r => r.active);
    if (activeRings.length === 0) {
      throw new Error('ConfigParser: At least one ring must be active');
    }

    return parsed;
  }

  /**
   * Parse general settings
   * @private
   */
  _parseGeneralSettings(config) {
    return {
      title: config.title || 'Annual Wheel',
      calendarSettings: this._validateEnum(
        config.calendarSettings,
        ['static', 'rolling'],
        'static',
        'calendarSettings'
      ),
      discRetention: this._validateEnum(
        config.discRetention,
        ['with-year', 'without-year'],
        'with-year',
        'discRetention'
      ),
      startYear: this._validateNumber(config.startYear, new Date().getFullYear(), 'startYear'),
      startMonth: this._validateRange(config.startMonth, 0, 11, 0, 'startMonth'),
      numberOfMonths: this._validateRange(config.numberOfMonths, 1, 60, 12, 'numberOfMonths'),
      colorPalette: Array.isArray(config.colorPalette) && config.colorPalette.length > 0
        ? config.colorPalette
        : ['#b8e6e6', '#ffd4d4', '#d4e8e0', '#f0dcd4'],
      sameRingHeight: config.sameRingHeight !== false, // Default true

      // Dimension settings
      innerRadius: this._validateNumber(config.innerRadius, 70, 'innerRadius', 10),
      outerRadius: this._validateNumber(config.outerRadius, 320, 'outerRadius', 50),
      viewBoxPadding: this._validateNumber(config.viewBoxPadding, 80, 'viewBoxPadding', 0),

      // Visual settings
      backgroundColor: config.backgroundColor || '#f5f7fa',
      fontFamily: config.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

      // Interactive features
      showTimeline: config.showTimeline !== false,
      enableZoom: config.enableZoom !== false,
      enableDetailPanel: config.enableDetailPanel !== false,
      interactive: config.interactive !== false,

      // Animation
      enableAnimations: config.enableAnimations !== false,
      animationDuration: this._validateNumber(config.animationDuration, 300, 'animationDuration', 0),
      animationEasing: config.animationEasing || 'cubic-bezier(0.4, 0, 0.2, 1)'
    };
  }

  /**
   * Parse rings configuration
   * @private
   */
  _parseRings(rings) {
    if (!Array.isArray(rings)) {
      throw new Error('ConfigParser: rings must be an array');
    }

    if (rings.length === 0) {
      throw new Error('ConfigParser: At least one ring must be defined');
    }

    return rings.map((ring, index) => {
      if (!ring.type) {
        throw new Error(`ConfigParser: Ring at index ${index} is missing 'type' property`);
      }

      const type = ring.type.toLowerCase();
      if (!this.validRingTypes.includes(type)) {
        throw new Error(
          `ConfigParser: Invalid ring type '${ring.type}' at index ${index}. ` +
          `Valid types: ${this.validRingTypes.join(', ')}`
        );
      }

      // Parse based on type
      switch (type) {
        case 'calendar':
          return this._parseCalendarRing(ring, index);
        case 'header':
          return this._parseHeaderRing(ring, index);
        case 'data':
          return this._parseDataRing(ring, index);
        default:
          throw new Error(`ConfigParser: Unknown ring type: ${type}`);
      }
    });
  }

  /**
   * Parse CalendarRing configuration
   * @private
   */
  _parseCalendarRing(ring, index) {
    const calendarType = ring.calendarType || 'Month Names';
    if (!this.validCalendarTypes.includes(calendarType)) {
      throw new Error(
        `ConfigParser: Invalid calendarType '${calendarType}' at ring index ${index}. ` +
        `Valid types: ${this.validCalendarTypes.join(', ')}`
      );
    }

    return {
      type: 'calendar',
      index,
      active: ring.active !== false,
      calendarType,
      showYear: ring.showYear !== false,
      color: ring.color || '#CCCCCC',
      height: this._validateNumber(ring.height, 10, `ring[${index}].height`, 1),
      separator: ring.separator !== false,
      fontSize: this._validateNumber(ring.fontSize, 11, `ring[${index}].fontSize`, 6),
      fontColor: ring.fontColor || '#333333',
      fontWeight: ring.fontWeight || '500'
    };
  }

  /**
   * Parse HeaderRing configuration
   * @private
   */
  _parseHeaderRing(ring, index) {
    if (!ring.headerText) {
      throw new Error(`ConfigParser: HeaderRing at index ${index} is missing 'headerText' property`);
    }

    return {
      type: 'header',
      index,
      active: ring.active !== false,
      headerText: String(ring.headerText),
      separator: ring.separator !== false,
      cells: this._validateNumber(ring.cells, 12, `ring[${index}].cells`, 1),
      color: ring.color || '#4ECDC4',
      height: this._validateNumber(ring.height, 15, `ring[${index}].height`, 1),
      fontSize: this._validateNumber(ring.fontSize, 10, `ring[${index}].fontSize`, 6),
      fontColor: ring.fontColor || '#FFFFFF',
      fontWeight: ring.fontWeight || '600'
    };
  }

  /**
   * Parse DataRing configuration
   * @private
   */
  _parseDataRing(ring, index) {
    const unit = ring.unit || 'day';
    if (!this.validTimeUnits.includes(unit)) {
      throw new Error(
        `ConfigParser: Invalid unit '${unit}' at ring index ${index}. ` +
        `Valid units: ${this.validTimeUnits.join(', ')}`
      );
    }

    return {
      type: 'data',
      index,
      active: ring.active !== false,
      name: ring.name || `Data Ring ${index + 1}`,
      color: ring.color || '#FF6B6B',
      unit,
      height: this._validateNumber(ring.height, 15, `ring[${index}].height`, 1),
      fontSize: this._validateNumber(ring.fontSize, 10, `ring[${index}].fontSize`, 6),
      fontColor: ring.fontColor || '#000000',
      fontWeight: ring.fontWeight || '600',
      showLabels: ring.showLabels !== false,
      interactive: ring.interactive !== false
    };
  }

  /**
   * Validate enum value
   * @private
   */
  _validateEnum(value, validValues, defaultValue, fieldName) {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    if (!validValues.includes(value)) {
      throw new Error(
        `ConfigParser: Invalid ${fieldName} '${value}'. ` +
        `Valid values: ${validValues.join(', ')}`
      );
    }
    return value;
  }

  /**
   * Validate number with optional minimum
   * @private
   */
  _validateNumber(value, defaultValue, fieldName, min = null) {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`ConfigParser: ${fieldName} must be a number, got '${value}'`);
    }
    if (min !== null && num < min) {
      throw new Error(`ConfigParser: ${fieldName} must be >= ${min}, got ${num}`);
    }
    return num;
  }

  /**
   * Validate number within range
   * @private
   */
  _validateRange(value, min, max, defaultValue, fieldName) {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`ConfigParser: ${fieldName} must be a number, got '${value}'`);
    }
    if (num < min || num > max) {
      throw new Error(`ConfigParser: ${fieldName} must be between ${min} and ${max}, got ${num}`);
    }
    return num;
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = ConfigParser;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return ConfigParser;
  });
} else {
  window.ConfigParser = ConfigParser;
}
