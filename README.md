# Growth and Fluctuations - A Visual Story of the U.S. Economy

## Introduction

Welcome to the user manual. This document provides all the necessary instructions to set up and run the project, including details on the libraries used, and usage.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Libraries and Dependencies](#libraries-and-dependencies)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Contact Information](#contact-information)

## Project Overview

This website serves as a gallery showcasing data visualizations that delve into various facets of the U.S. economy spanning the past century. You can see comparisons of U.S. GDP with other countries, understand import-export dynamics, and explore economic indicators like inflation and minimum wage.

## Libraries and Dependencies

The following libraries and their respective versions are used in this project:

### CSS Libraries

These CSS libraries are preloaded at runtime via CDN links included in `index.html`. Ensure you have an active internet connection as they do not require separate installation:

- **W3.CSS**:
  ```html
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" id="theme-style">
  ```
- **Google Fonts (Lato)**:
  ```html
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato">
  ```
- **Font Awesome (4.7.0)**:
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  ```

### JavaScript Libraries

These JavaScript libraries are also preloaded at runtime via CDN links included in `index.html`. Ensure you have an active internet connection as they do not require separate installation:

- **D3.js (v7)**:
  ```html
  <script src="https://d3js.org/d3.v7.min.js"></script>
  ```
- **ColorBrewer**:
  ```html
  <script src="https://colorbrewer2.org/export/colorbrewer.js"></script>
  ```
- **d3-legend (2.25.6)**:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-legend/2.25.6/d3-legend.min.js"></script>
  ```
- **d3-annotation (2.5.1)**:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-annotation/2.5.1/d3-annotation.min.js"></script>
  ```
- **Scrollama**:
  ```html
  <script src="https://unpkg.com/scrollama"></script>
  ```

Ensure you have these versions installed or linked to avoid compatibility issues. These resources are included directly in the `index.html` file of the project and will be loaded when you run the project, provided you have internet access.

## Installation

Follow these steps to set up the project:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/leaf5135/growth-and-fluctuations.git
   cd growth-and-fluctuations
   ```

## Using VS Code with Live Server Extension

*Note that this method of hosting the project is optional, and that there may be other preferred ways.*

2. **Open Project in Visual Studio Code**

   - Install [Visual Studio Code](https://code.visualstudio.com/).
   - Open the project folder in VS Code.

3. **Install Live Server Extension**

   - Open VS Code.
   - Go to the Extensions view by clicking on the square icon in the sidebar.
   - Search for "Live Server" in the search bar.
   - Click "Install" on the Live Server extension provided by Ritwick Dey.

4. **Start Live Server**

   - Once the extension is installed, you will see a "Go Live" button in the bottom-right corner of VS Code.
   - Click on the "Go Live" button to start the Live Server.
   - Your default web browser will open automatically, and you will see your website hosted on `localhost`.

That's it! You can now begin exploring.

## Usage

Navigation:

- Navigate through the website using the navbar located at the top. Click on the desired category to explore different sections or simply scroll down.

Graph Interaction:

- **Rebuild Button**: Located at the top-right corner, the "Rebuild" button resets the graph to its default state, allowing you to observe its construction process.

For each graph, you'll encounter various interactions:

- **Hover**: Hover over data points to access additional information.
- **Toggle Button**: Use toggle buttons to show or hide elements.
- **Dropdown Menu**: Select specific options to view corresponding data.
- **Zoom**: Scroll the mouse wheel to zoom in and out, or drag to adjust the graph's position.

Graphs (in order):

1. **Choropleth Worldmap**: Hover over each country for details. Rebuild shows the graph's transition.
2. **Streamgraph**: Hover over streams for information. Use mouse scroll to adjust zoom level, drag to change position. Rebuild resets the graph.
3. **Multiline Chart**: Hover over dots for details. Rebuild shows the graph's transition.
4. **Sequential Bar Chart**: Hover over bars for details. Use the dropdown menu to select data for specific years. Rebuild shows the graph's transition.
5. **Diverging Bar Chart**: Hover over bars for details. Rebuild shows the graph's transition.
6. **Line Chart**: Hover over dots for details. Rebuild shows the graph's transition.
7. **Scatterplot**: Hover over dots for details. Click toggle to change curve visibility. Use the dropdown menu to select timelapse speed. Rebuild shows the graph's transition in timelapse.
