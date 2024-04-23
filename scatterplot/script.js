// Set up the SVG canvas dimensions
const width = 1000;
const height = 800;
const margin = { top: 100, right: 100, bottom: 70, left: 100 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Append the SVG container to the scatterplot div
const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load data from CSV file
let data;
d3.csv("scatterplot/data.csv").then(function (csvData) {
    data = csvData;
    data.forEach(function (d) {
        d.year = +d["Years"];
        d.unemployment = +d["Unemployment rate (%)"] * 100;
        d.inflation = +d["Average inflation rate (%)"] * 100;
    });

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([0, 12])
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
        .style("font-size", "18px")
        .style("fill", "white");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${margin.left / 2}, ${height / 2 - 50}) rotate(-90)`)
        .text("Average Inflation Rate (%)")
        .style("font-size", "18px")
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
        .attr("fill", "green")
        .attr("r", 25)
        .transition()
        .delay((d, i) => i * 10)
        .duration(500)
        .attr("fill", "#8cff79")
        .attr("r", 5);

    // Add mouse events for tooltip
    svg.selectAll("circle")
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

    function drawCurve() {
        // Find the leftmost and bottommost points in the dataset
        const leftMostPoint = d3.min(data, d => xScale(d.unemployment));
        const bottomMostPoint = d3.max(data, d => yScale(d.inflation));

        // Calculate the average x and y coordinates
        const totalPoints = data.length;
        let sumX = 0;
        let sumY = 0;
        data.forEach(d => {
            sumX += d.unemployment;
            sumY += d.inflation;
        });
        const avgX = xScale(sumX / totalPoints);
        const avgY = yScale(sumY / totalPoints);

        // Define the curve data points
        const curveData = [
            [leftMostPoint, margin.top],
            [avgX, avgY],
            [width - margin.right, bottomMostPoint]
        ];

        // Generate the curve path using D3 curve function
        const curveLine = d3.line()
            .curve(d3.curveNatural)
            .x(d => d[0])
            .y(d => d[1]);

        // Append the curve path to the SVG
        svg.append("path")
            .datum(curveData)
            .attr("class", "curve")
            .attr("d", curveLine)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3);
    }

    // Function to remove the curve
    function removeCurve() {
        svg.select(".curve").remove();
    }

    // Event listener for toggle button
    d3.select("#toggleCurve").on("click", function() {
        const isCurveDrawn = !svg.select(".curve").empty();
        if (isCurveDrawn) {
            removeCurve();
        } else {
            drawCurve();
        }
    });
});
