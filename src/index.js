/**
 * Circalify - Circular Timeline Visualization Library
 * Main entry point
 * @license MIT
 */

// Import all modules in correct dependency order
import './constants.js';
import './layout-calculator.js';
import './config-parser.js';
import './base-ring.js';
import './calendar-ring.js';
import './header-ring.js';
import './data-ring.js';
import './ring-factory.js';
import './circalify-core.js';
import AnnualWheel from './circalify.js';

// Export as default
export default AnnualWheel;

// Also export as named export for flexibility
export { AnnualWheel };
