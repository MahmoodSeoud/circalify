/**
 * ConfigParser - Validates and parses Circalify configuration
 * @license MIT
 *
 * Requires: constants.js
 */

class ConfigParser {
  constructor() {
    // Destructure constants
    const { DIMENSIONS, VALIDATION, TIMING } = window.CIRCALIFY_CONSTANTS || {};

    // Store constants as instance properties for easy access
    this.DEFAULT_INNER_RADIUS = DIMENSIONS?.DEFAULT_INNER_RADIUS || 150;
    this.DEFAULT_OUTER_RADIUS = DIMENSIONS?.DEFAULT_OUTER_RADIUS || 420;
    this.DEFAULT_VIEWBOX_PADDING = DIMENSIONS?.DEFAULT_VIEWBOX_PADDING || 80;
    this.DEFAULT_RING_HEIGHT = DIMENSIONS?.DEFAULT_RING_HEIGHT || 10;
    this.MIN_RING_HEIGHT = DIMENSIONS?.MIN_RING_HEIGHT || 1;
    this.DEFAULT_FONT_SIZE = DIMENSIONS?.DEFAULT_FONT_SIZE || 15;
    this.MIN_FONT_SIZE = DIMENSIONS?.MIN_FONT_SIZE || 6;
    this.SMALL_FONT_SIZE = DIMENSIONS?.SMALL_FONT_SIZE || 7;
    this.MIN_MONTH = VALIDATION?.MIN_MONTH || 0;
    this.MAX_MONTH = VALIDATION?.MAX_MONTH || 11;
    this.MIN_MONTHS_COUNT = VALIDATION?.MIN_MONTHS_COUNT || 1;
    this.MAX_MONTHS_COUNT = VALIDATION?.MAX_MONTHS_COUNT || 60;
    this.DEFAULT_ANIMATION_DURATION = TIMING?.DEFAULT_ANIMATION_DURATION || 300;

    // Validation arrays
    this.validRingTypes = ['calendar', 'header', 'data'];
    // Support both kebab-case (user spec) and Title Case (legacy) for calendar types
    this.validCalendarTypes = [
      'month-names', 'Month Names',
      'weeks', 'Week Numbers',
      'days', 'Day Numbers',
      'quarters', 'Quarters'
    ];
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
        ['with-year', 'counter-clockwise'],
        'with-year',
        'discRetention'
      ),
      startYear: this._validateNumber(config.startYear, new Date().getFullYear(), 'startYear'),
      startMonth: this._validateRange(config.startMonth, this.MIN_MONTH, this.MAX_MONTH, 0, 'startMonth'),
      numberOfMonths: this._validateRange(config.numberOfMonths, this.MIN_MONTHS_COUNT, this.MAX_MONTHS_COUNT, 12, 'numberOfMonths'),
      colorPalette: Array.isArray(config.colorPalette) && config.colorPalette.length > 0
        ? config.colorPalette
        : ['#b8e6e6', '#ffd4d4', '#d4e8e0', '#f0dcd4'],
      sameRingHeight: config.sameRingHeight !== false, // Default true

      // Dimension settings - Standard values optimized for beautiful display
      // These values provide optimal spacing for event labels in the center
      // and proper ring proportions.
      innerRadius: this.DEFAULT_INNER_RADIUS,  // Provides center space for event info
      outerRadius: this.DEFAULT_OUTER_RADIUS,  // Maintains proper proportions
      viewBoxPadding: this.DEFAULT_VIEWBOX_PADDING, // Standard padding

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
      animationDuration: this._validateNumber(config.animationDuration, this.DEFAULT_ANIMATION_DURATION, 'animationDuration', 0),
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
    const calendarType = ring.calendarType || 'month-names';
    if (!this.validCalendarTypes.includes(calendarType)) {
      throw new Error(
        `ConfigParser: Invalid calendarType '${calendarType}' at ring index ${index}. ` +
        `Valid types: month-names, weeks, days, quarters`
      );
    }

    // Normalize calendarType to Title Case for internal use
    const normalizedType = this._normalizeCalendarType(calendarType);

    // showYear only applies to "Month Names" calendar type
    let showYear = false;
    if (normalizedType === 'Month Names') {
      showYear = ring.showYear !== false;
    } else if (ring.showYear !== undefined) {
      console.warn(
        `ConfigParser: showYear option is only valid for calendarType="month-names" (ring ${index}). ` +
        `Ignoring showYear for calendarType="${calendarType}".`
      );
    }

    return {
      type: 'calendar',
      index,
      active: ring.active !== false,
      calendarType: normalizedType,
      showYear,
      color: ring.color || '#CCCCCC',
      height: this._validateNumber(ring.height, this.DEFAULT_RING_HEIGHT, `ring[${index}].height`, this.MIN_RING_HEIGHT),
      separator: ring.separator !== false,
      fontSize: this._validateNumber(ring.fontSize, this.SMALL_FONT_SIZE, `ring[${index}].fontSize`, this.MIN_FONT_SIZE),
      fontColor: ring.fontColor || '#333333',
      fontWeight: ring.fontWeight || '500'
    };
  }

  /**
   * Normalize calendar type from kebab-case to Title Case
   * @private
   */
  _normalizeCalendarType(type) {
    const mapping = {
      'month-names': 'Month Names',
      'weeks': 'Week Numbers',
      'days': 'Day Numbers',
      'quarters': 'Quarters',
      // Also support Title Case directly (legacy)
      'Month Names': 'Month Names',
      'Week Numbers': 'Week Numbers',
      'Day Numbers': 'Day Numbers',
      'Quarters': 'Quarters'
    };
    return mapping[type] || type;
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
      height: this._validateNumber(ring.height, this.DEFAULT_FONT_SIZE, `ring[${index}].height`, this.MIN_RING_HEIGHT),
      fontSize: this._validateNumber(ring.fontSize, this.DEFAULT_RING_HEIGHT, `ring[${index}].fontSize`, this.MIN_FONT_SIZE),
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
      height: this._validateNumber(ring.height, this.DEFAULT_FONT_SIZE, `ring[${index}].height`, this.MIN_RING_HEIGHT),
      fontSize: this._validateNumber(ring.fontSize, this.DEFAULT_RING_HEIGHT, `ring[${index}].fontSize`, this.MIN_FONT_SIZE),
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
