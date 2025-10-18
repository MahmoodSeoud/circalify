/**
 * HeaderRing - Renders header text distributed across cells
 * @license MIT
 */

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
      const startAngle = (i * anglePerCell) - Math.PI / 2;
      const endAngle = ((i + 1) * anglePerCell) - Math.PI / 2;
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
        arcSpan * 0.75,
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
          'fill': 'rgba(255, 255, 255, 0.05)',
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

  /**
   * Alternative rendering: split text across cells
   * @private
   */
  _renderSplitText() {
    const cells = this.config.cells;
    const headerText = this.config.headerText;
    const labelRadius = this.center;

    // Split text into words
    const words = headerText.split(/\s+/);
    const wordsPerCell = Math.max(1, Math.ceil(words.length / cells));

    const anglePerCell = (2 * Math.PI) / cells;

    for (let i = 0; i < cells; i++) {
      const startAngle = (i * anglePerCell) - Math.PI / 2;
      const endAngle = ((i + 1) * anglePerCell) - Math.PI / 2;
      const centerAngle = (startAngle + endAngle) / 2;
      const arcSpan = endAngle - startAngle;

      // Draw separator
      if (i > 0) {
        this._drawSeparator(startAngle);
      }

      // Get words for this cell
      const startWordIndex = i * wordsPerCell;
      const endWordIndex = Math.min((i + 1) * wordsPerCell, words.length);
      const cellWords = words.slice(startWordIndex, endWordIndex);
      const cellText = cellWords.join(' ');

      if (cellText) {
        this._addCurvedLabel(
          cellText,
          centerAngle,
          arcSpan * 0.75,
          labelRadius,
          {
            fontSize: this.config.fontSize,
            fontColor: this.config.fontColor,
            fontWeight: this.config.fontWeight
          }
        );
      }
    }
  }

  /**
   * Alternative rendering: show text only in specific cells
   * @private
   */
  _renderSelectedCells(cellIndices = [0]) {
    const cells = this.config.cells;
    const headerText = this.config.headerText;
    const labelRadius = this.center;
    const anglePerCell = (2 * Math.PI) / cells;

    for (let i = 0; i < cells; i++) {
      const startAngle = (i * anglePerCell) - Math.PI / 2;
      const endAngle = ((i + 1) * anglePerCell) - Math.PI / 2;
      const centerAngle = (startAngle + endAngle) / 2;
      const arcSpan = endAngle - startAngle;

      // Draw separator
      if (i > 0) {
        this._drawSeparator(startAngle);
      }

      // Only show text in selected cells
      if (cellIndices.includes(i)) {
        this._addCurvedLabel(
          headerText,
          centerAngle,
          arcSpan * 0.75,
          labelRadius,
          {
            fontSize: this.config.fontSize,
            fontColor: this.config.fontColor,
            fontWeight: this.config.fontWeight
          }
        );
      }
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = HeaderRing;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return HeaderRing;
  });
} else {
  window.HeaderRing = HeaderRing;
}
