/**
 * Circalify Constants
 *
 * This file centralizes all magic numbers and hardcoded strings used throughout
 * the Circalify library. Organized by category for easy maintenance.
 *
 * Following John Carmack's philosophy: named constants make code self-documenting
 * and eliminate the cognitive load of remembering what arbitrary numbers mean.
 */

// ============================================================================
// GEOMETRY CONSTANTS (Temporal-Geometric Conversions)
// ============================================================================

const GEOMETRY = {
    // Circle angles (radians)
    FULL_CIRCLE: 2 * Math.PI,
    HALF_CIRCLE: Math.PI,
    QUARTER_CIRCLE: Math.PI / 2,
    THREE_QUARTER_CIRCLE: 3 * Math.PI / 2,

    // Starting angle (top of circle = 12 o'clock = -90°)
    ANGLE_OFFSET_TOP: -Math.PI / 2,

    // Arc span ratios for labels (how much of the segment to use for text)
    LABEL_ARC_SPAN_MONTH: 0.8,
    LABEL_ARC_SPAN_WEEK: 0.7,
    LABEL_ARC_SPAN_DAY: 0.6,
    LABEL_ARC_SPAN_QUARTER: 0.8,
    LABEL_ARC_SPAN_HEADER: 0.75,
};

// ============================================================================
// TIME CONSTANTS (Calendar Calculations)
// ============================================================================

const TIME = {
    // Milliseconds
    MS_PER_DAY: 86400000,  // 1000 * 60 * 60 * 24
    MS_PER_MINUTE: 60000,

    // Calendar units
    DAYS_PER_WEEK: 7,
    MONTHS_PER_YEAR: 12,
    QUARTERS_PER_YEAR: 4,
    MONTHS_PER_QUARTER: 3,

    // ISO week calculation
    ISO_WEEK_THURSDAY_OFFSET: 4,

    // Days per month (non-leap year)
    DAYS_PER_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

    // Month names (Danish - for backward compatibility)
    MONTH_NAMES_DA: [
        'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'December'
    ],

    // Month names (English)
    MONTH_NAMES_EN: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],

    // Short month names
    MONTH_ABBR: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    // Day names (Danish)
    DAY_NAMES_DA: ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'],

    // Day names (English)
    DAY_NAMES_EN: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],

    // Quarter labels
    QUARTER_LABELS: ['Q1', 'Q2', 'Q3', 'Q4'],
};

// ============================================================================
// DIMENSION CONSTANTS (Sizes, Spacing, Padding)
// ============================================================================

const DIMENSIONS = {
    // Default visualization dimensions
    DEFAULT_INNER_RADIUS: 150,
    DEFAULT_OUTER_RADIUS: 420,
    DEFAULT_VIEWBOX_PADDING: 80,

    // Ring dimensions
    DEFAULT_RING_HEIGHT: 10,
    MIN_RING_HEIGHT: 1,

    // Font sizes
    DEFAULT_FONT_SIZE: 15,
    MIN_FONT_SIZE: 6,
    SMALL_FONT_SIZE: 7,
    CALENDAR_FONT_SIZE_ADJUSTMENT: 2,
    LABEL_FONT_REDUCTION: 4,

    // Button dimensions
    BUTTON_OFFSET: 15,
    BUTTON_ARC_RATIO: 0.5,
    BUTTON_THICKNESS_RATIO: 0.7,
    BUTTON_FONT_SIZE: 8,
    BUTTON_FONT_WEIGHT: 600,
    BUTTON_LETTER_SPACING: 0.5,
    BUTTON_EXPANDED_ARC_RATIO: 0.7,
    BUTTON_EXPANDED_THICKNESS: 20,
    BUTTON_PADDING_HORIZONTAL: 16,
    BUTTON_PADDING_VERTICAL: 20,

    // Plus indicator (for overflow events)
    PLUS_INDICATOR_MAX_SIZE: 8,
    PLUS_INDICATOR_SIZE_RATIO: 0.3,
    PLUS_INDICATOR_STROKE_WIDTH: 1,
    PLUS_INDICATOR_OFFSET: 8,

    // Zoom controls
    ZOOM_CONTROL_WIDTH: 60,
    ZOOM_CONTROL_HEIGHT: 120,
    ZOOM_BUTTON_SIZE: 40,
    ZOOM_ICON_SIZE: 90,
    ZOOM_BUTTON_SPACING: 20,

    // Detail panel
    DETAIL_PANEL_PADDING: 20,
    DETAIL_PANEL_WIDTH: 320,
    DETAIL_PANEL_BORDER_RADIUS: 12,
    DETAIL_PANEL_SPACING: 24,

    // Sidebar
    SIDEBAR_WIDTH: 340,
    SIDEBAR_PADDING: 10,
    SIDEBAR_HEADER_SIZE: 16,

    // Event list items
    EVENT_ITEM_PADDING: 20,
    EVENT_ITEM_GAP_SMALL: 2,
    EVENT_ITEM_GAP_MEDIUM: 4,
    EVENT_ITEM_GAP_LARGE: 14,
    EVENT_ITEM_FONT_SIZE: 12,
    EVENT_ITEM_MAX_HEIGHT: 40,

    // Text sizing
    CHAR_WIDTH_RATIO: 0.6,
    MIN_TRUNCATE_CHARS: 2,
    ELLIPSIS_WIDTH_CHARS: 1.5,

    // Calendar day label spacing
    MIN_DAY_LABEL_INTERVAL: 5,
    MAX_DAY_LABELS: 36,

    // Circle background
    CIRCLE_BG_PADDING: 20,
};

// ============================================================================
// STYLING CONSTANTS (Colors, Opacity, Strokes)
// ============================================================================

const STYLING = {
    // Brand colors
    BRAND_COLOR: '#3c3485',

    // Opacity values
    RING_BACKGROUND_OPACITY: 0.6,
    RING_SEPARATOR_OPACITY: 0.4,
    CALENDAR_SEPARATOR_OPACITY: 0.15,
    EVENT_STROKE_OPACITY: 0.85,
    CELL_BACKGROUND_OPACITY: 0.05,
    PLUS_INDICATOR_OPACITY: 0.3,

    // Stroke widths
    RING_SEPARATOR_STROKE: 0.5,
    CALENDAR_SEPARATOR_STROKE: 0.5,
    EVENT_STROKE_WIDTH: 1,
    EVENT_HOVER_STROKE_WIDTH: 2,
    CIRCLE_BG_STROKE: 1,
    PLUS_INDICATOR_STROKE: 1,

    // Stroke dash arrays
    CALENDAR_SEPARATOR_DASH: '2,2',
};

// ============================================================================
// TIMING CONSTANTS (Animations, Intervals)
// ============================================================================

const TIMING = {
    // Animation durations (milliseconds)
    DEFAULT_ANIMATION_DURATION: 300,

    // Update intervals
    TIMELINE_UPDATE_INTERVAL: 60000,  // 1 minute
};

// ============================================================================
// VALIDATION CONSTANTS (Limits, Ranges)
// ============================================================================

const VALIDATION = {
    // Month range (0-indexed)
    MIN_MONTH: 0,
    MAX_MONTH: 11,

    // Number of months to display
    MIN_MONTHS_COUNT: 1,
    MAX_MONTHS_COUNT: 60,
};

// ============================================================================
// ID GENERATION CONSTANTS
// ============================================================================

const ID_GENERATION = {
    RADIX: 36,           // Base-36 for alphanumeric IDs
    START_INDEX: 2,      // Skip "0." prefix from Math.random()
    LENGTH: 9,           // 9 characters for uniqueness
};

// ============================================================================
// EXPORT
// ============================================================================

// Export all constants as a single object for ES6 modules
const CIRCALIFY_CONSTANTS = {
    GEOMETRY,
    TIME,
    DIMENSIONS,
    STYLING,
    TIMING,
    VALIDATION,
    ID_GENERATION,
};

// Export for ES6 modules
export default CIRCALIFY_CONSTANTS;
export { GEOMETRY, TIME, DIMENSIONS, STYLING, TIMING, VALIDATION, ID_GENERATION };

// Also make available globally for browser compatibility
if (typeof window !== 'undefined') {
    window.CIRCALIFY_CONSTANTS = CIRCALIFY_CONSTANTS;
    window.GEOMETRY = GEOMETRY;
    window.TIME = TIME;
    window.DIMENSIONS = DIMENSIONS;
    window.STYLING = STYLING;
    window.TIMING = TIMING;
    window.VALIDATION = VALIDATION;
    window.ID_GENERATION = ID_GENERATION;
}
