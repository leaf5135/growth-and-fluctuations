// Set up the SVG canvas dimensions
const width = 1000;
const height = 1000;
const margin = { top: 100, right: 100, bottom: 70, left: 100 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Append the SVG container to the scatterplot div
const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load data from CSV file
d3.csv("scatterplot/data.csv").then(function (data) {
    data.forEach(function (d) {
        d.year = +d["Years"];
        d.unemployment = +d["Unemployment rate (%)"] * 100;
        d.inflation = +d["Average inflation rate (%)"] * 100;
    });

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([0, 15])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([-5, 20])
        .range([height - margin.bottom - 100, margin.top]);

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);

    // Add labels for axes
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width / 2}, ${height - 100})`)
        .text("Unemployment Rate (%)")
        .style("font-size", "24px")
        .style("fill", "white");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${margin.left / 2}, ${height / 2}) rotate(-90)`)
        .text("Average Inflation Rate (%)")
        .style("font-size", "24px")
        .style("fill", "white");

    // Select the tooltip element
    var tooltip = d3.select(".tooltip");

    // Add data points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.unemployment))
        .attr("cy", d => yScale(d.inflation))
        .attr("r", 5)
        .attr("fill", "#8cff79")
        .on("mousemove", function (event, d) {
            d3.select(this)
                .attr("fill", "green")
                .attr("r", 10);

            // Show tooltip
            tooltip.style("opacity", 1)
                .html(`<strong>Year:</strong> ${d.year}<br><strong>Unemployment Rate:</strong> ${d.unemployment.toFixed(2)}%<br><strong>Inflation Rate:</strong> ${d.inflation.toFixed(2)}%`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseleave", function (event, d) {
            d3.select(this)
                .attr("fill", "#8cff79")
                .attr("r", 5);

            // Hide tooltip
            tooltip.style("opacity", 0);
        });

});
