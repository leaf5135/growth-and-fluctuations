// Set up the SVG canvas dimensions
const width = 1000;
const height = 800;
const margin = { top: 10, right: 100, bottom: 70, left: 100 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom - 90;

// Values for the dropdown menu
const values = [10, 200, 500];
const labels = ["Fast", "Normal", "Slow"];
const dropdown = d3
    .select("#speed-dropdown")
    .append("select")
    .attr("id", "speed-select");

function build() {
d3.select("#scatterplot svg").remove();

// Append the SVG container to the scatterplot div
const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load data from CSV file
let data;
d3.csv("scatterplot/data.csv").then(function (csvData) {
    // Create dropdown menu
    dropdown
        .selectAll("option")
        .data(values)
        .enter()
        .append("option")
        .attr("value", (d, i) => d)
        .text((d, i) => labels[i]);

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
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "14px");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "14px");

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
    const speed = dropdown.property("value");
    // console.log(speed);
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.unemployment))
        .attr("cy", d => yScale(d.inflation))
        .attr("fill", "green")
        .attr("r", speed >= 100 ? 2 : 25)
        .style("stroke", "white")
        .style("stroke-width", 0.5)
        .attr("opacity", 0)
        .transition()
        .delay((d, i) => i * speed)
        .duration(500)
        .attr("fill", "#8cff79")
        .attr("r", 5)
        .attr("opacity", 0.8)
        .on("start", function(d) {
            // Display year value above the dot during transition if speed is Normal or Slow
            if (speed >= 100) {
                const xPos = xScale(d.unemployment);
                const yPos = yScale(d.inflation) - 10;
                svg.append("text")
                    .attr("class", "year-label")
                    .attr("x", xPos)
                    .attr("y", yPos)
                    .attr("text-anchor", "middle")
                    .text(d.year)
                    .style("font-size", "18px")
                    .style("fill", "white")
                    .style("opacity", 0)
                    .transition()
                    .style("opacity", 1)
                    .attr("y", yPos - 10);
            }
        })
        .on("end", function() {
            d3.select(".year-label").remove();
        });

    // Add a faint line on the y = 0 axis
    svg.append("line")
    .attr("x1", margin.left)
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .transition()
    .delay(75 * speed)
    .duration(2000)
    .attr("x2", width - margin.right)
    .attr("stroke", "rgba(255, 255, 255, 0.5)")
    .attr("stroke-dasharray", "3,3")
    .attr("stroke-width", 1);

    // Add mouse events for tooltip
    svg.selectAll("circle")
        .on("mousemove", function (event, d) {
            d3.select(this)
                .attr("fill", "green")
                .attr("r", 10);

            // Reduce opacity of other circles
            svg.selectAll("circle").filter(dot => dot !== d).attr("opacity", 0.3);

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

            // Reset opacity of other circles
            svg.selectAll("circle").attr("opacity", 0.8);

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
        const path = svg.append("path")
            .datum(curveData)
            .attr("class", "curve")
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3)
            .attr("d", curveLine)
            .style("opacity", 0);

        // Animate the curve path
        path.transition()
            .attr("stroke-dasharray", function() {
                return this.getTotalLength() + " " + this.getTotalLength();
            })
            .attr("stroke-dashoffset", function() {
                return this.getTotalLength();
            })
            .delay(75 * speed)
            .transition()
            .duration(2000)
            .style("opacity", 0.8)
            .attr("stroke-dashoffset", 0);
    }

    function showCurve() {
        svg.select(".curve").transition().duration(500).style("opacity", 0.8);
    }

    function hideCurve() {
        svg.select(".curve").transition().duration(500).style("opacity", 0);
    }

    // Event listener for toggle button
    drawCurve();
    d3.select("#toggleCurve").on("click", function() {
        const isCurveDrawn = svg.select(".curve").style("opacity") == 0.8;
        if (isCurveDrawn) {
            hideCurve();
        } else {
            showCurve();
        }
    });
});
}

build();
document.getElementById("reloadButton").addEventListener("click", build);
