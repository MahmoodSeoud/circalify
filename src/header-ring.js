/**
 * HeaderRing - Renders header text distributed across cells
 * Requires: constants.js, base-ring.js
 * @license MIT
 */

import BaseRing from './base-ring.js';

class HeaderRing extends BaseRing {
  constructor(config, boundaries, context) {
    super(config, boundaries, context);
  }

  /**
   * Render the header ring
   */
  render() {
    // Draw background
    this._drawRingBackground();

    // Divide ring into cells and render header text
    this._renderHeaderCells();
  }

  /**
   * Render header cells with text
   * @private
   */
  _renderHeaderCells() {
    const cells = this.config.cells;
    const headerText = this.config.headerText;
    const labelRadius = this.center;

    // Calculate angle per cell
    const anglePerCell = (2 * Math.PI) / cells;

    for (let i = 0; i < cells; i++) {
      // Calculate angles for this cell
      const startAngle = (i * anglePerCell) + GEOMETRY.ANGLE_OFFSET_TOP;
      const endAngle = ((i + 1) * anglePerCell) + GEOMETRY.ANGLE_OFFSET_TOP;
      const centerAngle = (startAngle + endAngle) / 2;
      const arcSpan = endAngle - startAngle;

      // Draw separator at cell boundary
      if (i > 0) {
        this._drawSeparator(startAngle);
      }

      // Add header text label
      // For multiple cells, repeat the text in each cell
      // Alternative: could split text across cells or show only in one cell
      this._addCurvedLabel(
        headerText,
        centerAngle,
        arcSpan * GEOMETRY.LABEL_ARC_SPAN_HEADER,
        labelRadius,
        {
          fontSize: this.config.fontSize,
          fontColor: this.config.fontColor,
          fontWeight: this.config.fontWeight
        }
      );

      // Optional: Add cell background with slight variation
      if (i % 2 === 0) {
        const cellPath = this._createArcPath(
          this.inner,
          this.outer,
          startAngle,
          endAngle
        );

        const cellBg = this._createSVGElement('path', {
          'd': cellPath,
          'fill': `rgba(255, 255, 255, ${STYLING.CELL_BACKGROUND_OPACITY})`,
          'stroke': 'none',
          'class': 'header-cell-bg'
        });

        // Insert before text
        this.svgGroups.rings.insertBefore(
          cellBg,
          this.svgGroups.rings.firstChild
        );
        this.elements.unshift(cellBg);
      }
    }
  }

  // Removed unused alternative implementations (_renderSplitText, _renderSelectedCells)
  // These methods were never called and provided duplicate functionality
}

// Export for ES6 modules
export default HeaderRing;

// Also make available globally for browser compatibility
if (typeof window !== 'undefined') {
  window.HeaderRing = HeaderRing;
}
