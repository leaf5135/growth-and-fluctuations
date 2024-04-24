const margin = { top: 50, right: 50, bottom: 75, left: 100 };
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#bar-div")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 200)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data
d3.csv("bar-div/data.csv")
.then(data => {
    // Define scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Years))
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([-0.15, 0.2])
        .range([height, 0]);

    const colorScale = d3.scaleDiverging()
        .domain([-0.15, 0, 0.2])
        .range([colorbrewer.RdYlGn[9][0], colorbrewer.RdYlGn[9][4], colorbrewer.RdYlGn[9][8]]);

    // Draw bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.Years))
        .attr("y", d => yScale(0))
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", d => colorScale(parseFloat(d['Average inflation rate (%)'])))
        .on("mouseover", showTooltip)
        .on("mousemove", (event, d) => updateTooltip(event, d))
        .on("mouseleave", hideTooltip)
        .transition()
        .duration(1000)
        .attr("y", d => {
            const value = parseFloat(d['Average inflation rate (%)']);
            return value >= 0 ? yScale(value) : yScale(0);
        })
        .attr("height", d => Math.abs(yScale(parseFloat(d['Average inflation rate (%)'])) - yScale(0)));

    // Tooltip
    const tooltip = d3.select(".tooltip");

    // Add legend
    svg.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(" + (width + 50) + "," + 20 + ")")
        .style("fill", "white");

    var legendSequential = d3.legendColor()
        .shapeWidth(30)
        .cells(8)
        .orient("vertical")
        .scale(colorScale)
        .labelFormat(d3.format(".0%"))
        .ascending(true)
        .title("Rate");

    svg.select(".legendSequential")
        .call(legendSequential);

    // Draw axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
            .tickSize(0)
            .tickValues(xScale.domain().filter((d, i) => d % 20 === 0 && d >= 1920)))
        .selectAll("text")
        .style("font-size", "12px");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => d * 100 + "%"))
        .selectAll("text")
        .style("font-size", "12px");

    // Add vertical lines
    const tickValues = yScale.ticks();
    tickValues.shift();
    svg.selectAll(".vertical-line")
        .data(tickValues)
        .enter()
        .append("line")
        .attr("class", "vertical-line")
        .attr("x1", 0)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .transition()
        .duration(1000)
        .attr("x2", width)
        .style("stroke", "gray")
        .style("stroke-dasharray", "2,2");

    // Remove y-axis line
    svg.select(".y-axis")
        .selectAll("path")
        .remove();

    // Add axis labels
    // svg.append("text")
    //     .attr("class", "x-axis-label")
    //     .attr("x", width / 2)
    //     .attr("y", height + margin.bottom - 25)
    //     .attr("text-anchor", "middle")
    //     .text("Year")
    //     .style("font-size", "18px")
    //     .style("fill", "white");

    // svg.append("text")
    //     .attr("class", "y-axis-label")
    //     .attr("x", -height / 2)
    //     .attr("y", -margin.left + 50)
    //     .attr("text-anchor", "middle")
    //     .attr("transform", "rotate(-90)")
    //     .text("Inflation Rate (%)")
    //     .style("font-size", "18px")
    //     .style("fill", "white");

    // Tooltip functions
    function showTooltip() {
        tooltip.transition().style("opacity", 1).duration(500);
    }

    function updateTooltip(event, d) {
        tooltip.html(
            `<strong>Year:</strong> ${d.Years}<br>
            <strong>Inflation Rate:</strong> ${parseFloat(100 * d['Average inflation rate (%)']).toFixed(2)}%`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
    }

    function hideTooltip() {
        tooltip.transition().duration(250).style("opacity", 0);
    }
});