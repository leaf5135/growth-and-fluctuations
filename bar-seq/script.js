// Define dimensions and margins
const margin = { top: 25, right: 500, bottom: 250, left: 400 };
const width = 1600 - margin.left - margin.right;
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
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleBand().range([0, height]).padding(0.25);

// Add x-axis
const xAxis = svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${height})`);

// Add y-axis
const yAxis = svg.append("g").attr("class", "y-axis");

// Add x-axis label
svg.append("text")
  .attr("transform", `translate(${width / 2}, ${height +  margin.top / 2 + 50})`)
  .style("text-anchor", "middle")
  .style("font-size", "18px")
  .style("fill", "white")
  .text("Value (USD)");

// Tooltip functions
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Add legend titles
svg.append("text")
    .attr("class", "legend-title")
    .attr("x", width + 50)
    .attr("y", 10)
    .style("text-anchor", "start")
    .style("font-size", "16px")
    .style("fill", "white")
    .text("Imports");

svg.append("text")
    .attr("class", "legend-title")
    .attr("x", width + 50)
    .attr("y", 160)
    .style("text-anchor", "start")
    .style("font-size", "16px")
    .style("fill", "white")
    .text("Exports");

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
        xScale.domain([0, d3.max(combinedData, (d) => Math.max(d.import, d.export))]);
        yScale.domain(combinedData.map((d) => d.type));

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
            .attr("transform", `translate(${width + 50}, 20)`)
            .style("fill", "white");

        svg.append("g")
            .attr("class", "legend export-legend")
            .attr("transform", `translate(${width + 50}, 170)`)
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
            .text((d) => d3.format("$.2s")(d));

        svg.select(".export-legend")
            .call(exportLegend)
            .selectAll("text")
            .text((d) => d3.format("$.2s")(d));

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
            .attr("x", 0)
            .attr("y", (d) => yScale(d.type))
            .attr("width", 0)
            .attr("height", yScale.bandwidth() / 2)
            .style("fill", (d) => importColor(d.import))
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
            .attr("x", 0)
            .attr("y", (d) => yScale(d.type) + yScale.bandwidth() / 2)
            .attr("width", 0)
            .attr("height", yScale.bandwidth() / 2)
            .style("fill", (d) => exportColor(d.export))
            .on("mouseover", showTooltip)
            .on("mousemove", updateTooltip)
            .on("mouseleave", hideTooltip);

        exportBars.transition().duration(1000).attr("width", (d) => xScale(d.export));

        // Update existing import bars
        const updatedImportBars = svg
            .selectAll(".import-bar")
            .data(combinedData)
            .attr("width", 0)
            .transition()
            .duration(1000)
            .attr("width", (d) => xScale(d.import))
            .attr("fill", (d) => importColor(d.import));

        // Axes update
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale).tickFormat(d3.format("$.2s"))).selectAll("text").style("font-size", "12px").select(".domain").remove();
        yAxis.transition().duration(1000).call(d3.axisLeft(yScale)).selectAll("text").style("font-size", "14px");

        // Add vertical lines
        svg.selectAll(".vertical-line").remove();
        const tickValues = xScale.ticks();
        svg.selectAll(".vertical-line")
            .data(tickValues)
            .enter()
            .append("line")
            .attr("class", "vertical-line")
            .transition()
            .duration(1000)
            .attr("x1", (d) => xScale(d))
            .attr("y1", 0)
            .attr("x2", (d) => xScale(d))
            .attr("y2", height)
            .style("stroke", "gray")
            .style("stroke-dasharray", "2,2");

        // Tooltip functions
        function showTooltip() {
            tooltip.transition().style("opacity", 1).duration(500);
        }

        function updateTooltip(event, d) {
            tooltip.html(
                `<strong>${d.type}</strong><br>
                Import: $${addCommas(d.import)}<br>
                Export: $${addCommas(d.export)}<br>
                ${d.import > d.export ? "Import is greater" : "Export is greater"}
                (difference): $${addCommas(Math.abs(d.import - d.export))}`)
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        }

        function hideTooltip() {
            tooltip.transition().duration(250).style("opacity", 0);
        }

        function addCommas(number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }
  })
  .catch(console.error);
