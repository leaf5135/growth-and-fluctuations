// Define dimensions and margins
const margin = { top: 100, right: 500, bottom: 250, left: 250 };
const width = 1500 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Create SVG element
const svg = d3
  .select("#bar-seq")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Define scales
const xScale = d3.scaleBand().range([0, width]).padding(0.25);
const yScale = d3.scaleLinear().range([height, 0]);

// Add x-axis
const xAxis = svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${height})`);

// Add y-axis
const yAxis = svg.append("g").attr("class", "y-axis");

// Add x-axis label
svg.append("text")
  .attr("transform", `translate(${width / 2}, ${height +  margin.top / 2 + 150})`)
  .style("text-anchor", "middle")
  .style("font-size", "18px")
  .style("fill", "white")
  .style("font-weight", "bold")
  .text("Type of Good");

// Add y-axis label
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left / 2 - 50)
  .attr("x", 0 - height / 2)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "18px")
  .style("fill", "white")
  .style("font-weight", "bold")
  .text("Value (USD)");

// Add legend titles
svg.append("text")
  .attr("class", "legend-title")
  .attr("x", width + 20)
  .attr("y", 10)
  .style("text-anchor", "start")
  .style("font-size", "16px")
  .style("fill", "white")
  .text("Imports Value (USD)");

svg.append("text")
  .attr("class", "legend-title")
  .attr("x", width + 20)
  .attr("y", 160)
  .style("text-anchor", "start")
  .style("font-size", "16px")
  .style("fill", "white")
  .text("Exports Value (USD)");

// Tooltip functions
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load data
Promise.all([d3.csv("bar-seq/data-import.csv"), d3.csv("bar-seq/data-export.csv")])
  .then(([importsData, exportsData]) => {
    // Extract years
    const years = importsData.map((d) => d.Years);

    // Create dropdown menu
    const dropdown = d3
      .select("#year-dropdown")
      .append("select")
      .attr("id", "year-select")
      .on("change", updateChart);

    dropdown
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .text((d) => d);

    // Initial update
    updateChart();

    function updateChart() {
      const selectedYear = dropdown.property("value");

      // Filter data for selected year
      const importsYearData = importsData.find((d) => d.Years === selectedYear);
      const exportsYearData = exportsData.find((d) => d.Years === selectedYear);

      // Combine import and export data
      const combinedData = [];
      for (const column in importsYearData) {
        if (column !== "Years") {
          combinedData.push({
            type: column,
            import: parseFloat(importsYearData[column]),
            export: parseFloat(exportsYearData[column]),
          });
        }
      }

      // Update scales domain
      xScale.domain(combinedData.map((d) => d.type));
      yScale.domain([
        0,
        d3.max(combinedData, (d) => Math.max(d.import, d.export)),
      ]);

      // Color scale
      var importColor = d3.scaleSequential()
        .domain([0, d3.max(combinedData, (d) => d.import)])
        .range([colorbrewer.PuBu[9][3], colorbrewer.PuBu[9][7]])
        .nice();

      var exportColor = d3.scaleSequential()
        .domain([0, d3.max(combinedData, (d) => d.export)])
        .range([colorbrewer.OrRd[9][3], colorbrewer.OrRd[9][7]])
        .nice();

      // Add color legends
      svg.selectAll(".legend").remove();
      svg.append("g")
        .attr("class", "legend import-legend")
        .attr("transform", `translate(${width + 20}, 20)`)
        .style("fill", "white");

      svg.append("g")
        .attr("class", "legend export-legend")
        .attr("transform", `translate(${width + 20}, 170)`)
        .style("fill", "white");

      var importLegend = d3.legendColor()
        .shapeWidth(30)
        .cells(5)
        .orient("vertical")
        .scale(importColor);

      var exportLegend = d3.legendColor()
        .shapeWidth(30)
        .cells(5)
        .orient("vertical")
        .scale(exportColor);

      svg.select(".import-legend")
        .call(importLegend)
        .selectAll("text")
        .text(function(d) { return d3.format(",")(d); });

      svg.select(".export-legend")
        .call(exportLegend)
        .selectAll("text")
        .text(function(d) { return d3.format(",")(d); });

      // Update existing bars
      const bars = svg.selectAll(".bar").data(combinedData);

      // Remove bars that are no longer needed
      bars.exit().remove();

      // Create import bars
      const importBars = svg
        .selectAll(".import-bar")
        .data(combinedData)
        .enter()
        .append("rect")
        .attr("class", "bar import-bar")
        .attr("x", (d) => xScale(d.type))
        .attr("y", (d) => yScale(d.import))
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", (d) => height - yScale(d.import))
        .attr("fill", (d) => importColor(d.import))
        .on("mouseover", showTooltip)
        .on("mousemove", updateTooltip)
        .on("mouseleave", hideTooltip);

      // Create export bars
      const exportBars = svg
        .selectAll(".export-bar")
        .data(combinedData)
        .enter()
        .append("rect")
        .attr("class", "bar export-bar")
        .attr("x", (d) => xScale(d.type) + xScale.bandwidth() / 2)
        .attr("y", (d) => yScale(d.export))
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", (d) => height - yScale(d.export))
        .attr("fill", (d) => exportColor(d.export))
        .on("mouseover", showTooltip)
        .on("mousemove", updateTooltip)
        .on("mouseleave", hideTooltip);

      // Update x-axis
      xAxis
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em")
        .style("font-size", "14px")
        .attr("transform", "rotate(-30)");

      // Update y-axis
      yAxis.style("font-size", "14px").call(d3.axisLeft(yScale));

      // Tooltip functions
      function showTooltip(event, d) {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.type}</strong><br>
        Import: $${addCommas(d.import)}<br>
        Export: $${addCommas(d.export)}<br>
        ${d.import > d.export ? "Import is greater" : "Export is greater"}
        (difference): $${addCommas(Math.abs(d.import - d.export))}`
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px");
      }

      function updateTooltip(event) {
        tooltip
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px");
      }

      function hideTooltip() {
        tooltip.style("opacity", 0);
      }

      function addCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    }
  })
  .catch(console.error);
