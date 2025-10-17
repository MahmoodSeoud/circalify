# SVG Drawing with SVG.js Library

This is a sample file demonstrating how to use the SVG.js library to draw SVG elements on an HTML page.

## Introduction

SVG.js is a lightweight library for manipulating and animating SVGs. It provides a simple and powerful API for creating and modifying SVG elements.

## Prerequisites

To use SVG.js, you need to include it in your HTML file. You can either download the library from the [SVG.js website](https://svgjs.dev/docs/3.0/) or include it via a CDN. Here's how to get it with node:

```node
npm install @svgdotjs/svg.js
```

## Drawing SVG Elements

Once you have included the SVG.js library, you can start drawing SVG elements on your page. Here's a sample file that demonstrates how to draw circles, lines, and text on an SVG canvas:



# Utility File Documentation

This is a JavaScript utility file containing variables and functions for a graphical representation of data on a circular chart. The file exports various constants and functions to be used in other parts of the program.

### Constants

-   `Cx`: A constant for the X-coordinate of the center of the circular chart.
-   `Cy`: A constant for the Y-coordinate of the center of the circular chart.
-   `R`: A constant for the radius of the circular chart.
-   `Nx`: A variable to store the next X-coordinate.
-   `Ny`: A variable to store the next Y-coordinate.

### Exported Objects

#### `months`

An object that contains information about the months of the year. Each month is represented as a key-value pair, where the key is the three-letter abbreviation of the month name, and the value is an object with two properties:

-   `value`: A number representing the month (0-11).
-   `angle`: An angle in degrees representing the position of the month on the circular chart.

#### `areaLabel`

An object that contains information about the different areas of the chart. Each area is represented as a key-value pair, where the key is a string representing the name of the area, and the value is an object with four properties:

-   `position`: A decimal number between 0 and 1 representing the position of the area on the circular chart.
-   `color`: A string representing the color of the area.
-   `label`: A string representing the label of the area.
-   `radius`: A number representing the radius of the area.

#### `calcLineCoord(p: string[])`

A function that takes an array of month abbreviations as an argument and returns an array of objects representing the coordinates of the lines connecting the center of the chart to the edges of each area on the circular chart. Each object has four properties:

-   `month`: A string representing the month abbreviation.
-   `x1`: The X-coordinate of the center of the chart.
-   `y1`: The Y-coordinate of the center of the chart.
-   `x2`: The X-coordinate of the edge of the area on the circular chart.
-   `y2`: The Y-coordinate of the edge of the area on the circular chart.

#### `calcTextCoord(p: string[])`

A function that takes an array of month abbreviations as an argument and returns an array of objects representing the coordinates of the text labels for each month on the circular chart. Each object has four properties:

-   `month`: A string representing the month abbreviation.
-   `x1`: The X-coordinate of the center of the chart.
-   `y1`: The Y-coordinate of the center of the chart.
-   `x2`: The X-coordinate of the text label on the circular chart.
-   `y2`: The Y-coordinate of the text label on the circular chart.




## Global Variables

Yes, here's an example of how you can create a table with global variables in markdown:

| Variable Name | Description |
| --- | --- |
| `Cx` | The center X-coordinate of a circle |
| `Cy` | The center Y-coordinate of a circle |
| `R` | The radius of the circle |
| `Nx` | The next X-coordinate |
| `Ny` | The next Y-coordinate |
| `months` | An object that contains the months of the year with their corresponding values and angles |
| `areaLabel` | An object that contains the areas with their positions, colors, labels, and radius |
| `calcLineCoord` | A function that calculates the coordinates of the lines that connect the center of the circle to the months |
| `calcTextCoord` | A function that calculates the coordinates of the text labels that correspond to each month |
| `calcBubbelDates` | A function that calculates the coordinates of the bubbles that correspond to each month, given a specific month and area |