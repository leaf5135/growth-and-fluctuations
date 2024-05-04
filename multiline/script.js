// Set up the SVG container
const width = 800;
const height = 600;
const margin = { top: 50, right: 50, bottom: 100, left: 175 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

function build() {
d3.select("#multiline svg").remove();

const svg = d3.select("#multiline")
    .append("svg")
    .attr("width", width + 200)
    .attr("height", height);

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Annotations
const annotations = [
    {
        note: {
            title: 'Financial Crisis and Great Recession',
        },
        x: 400,
        y: 275,
        dx: 0,
        dy: 100,
        width: 300,
        type: d3.annotationLabel
    },
    {
        note: {
            title: 'COVID-19 Pandemic',
        },
        x: 700,
        y: 175,
        dx: 0,
        dy: 100,
        width: 300,
        type: d3.annotationLabel
    }
];

const makeAnnotations = d3.annotation()
    .annotations(annotations);

svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)
    .style("opacity", 0)
    .transition()
    .delay(1000)
    .duration(1000)
    .style("opacity", 1);

// Load data from CSV
d3.csv("multiline/data.csv").then(data => {
    // Convert numeric strings to numbers
    data.forEach(d => {
        d.Year = +d.Years;
        d.Imports = +d.Imports;
        d.Exports = +d.Exports;
    });

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.Imports, d.Exports))])
        .range([chartHeight, 0]);

    // Define the line functions
    const lineImports = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.Imports));

    const lineExports = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.Exports));

    // Add lines for imports
    chart.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorbrewer.PuBu[9][5])
        .attr("stroke-width", 2)
        .attr("d", lineImports)
        .transition()
        .duration(1000)
        .attrTween("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return function(t) {
                return (d3.interpolateString("0," + length, length + "," + length))(t);
            };
        });

    // Add lines for exports
    chart.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorbrewer.OrRd[9][5])
        .attr("stroke-width", 2)
        .attr("d", lineExports)
        .transition()
        .duration(1000)
        .attrTween("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return function(t) {
                return (d3.interpolateString("0," + length, length + "," + length))(t);
            };
        });

    // Add data points
    chart.selectAll("circle.imports")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "imports")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Imports))
        .attr("fill", colorbrewer.PuBu[9][5])
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut)
        .transition()
        .delay((d, i) => i * 50)
        .duration(1000)
        .attr("r", 5);

    chart.selectAll("circle.exports")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "exports")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Exports))
        .attr("fill", colorbrewer.OrRd[9][5])
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut)
        .transition()
        .delay((d, i) => i * 50)
        .duration(1000)
        .attr("r", 5);

    const tooltip = d3.select(".tooltip");

    var format = number => (d3.format(".3s")(number).replace(/T/, " Trillion").replace(/G/, " Billion").replace(/M/, " Million").replace(/k/, " Thousand"));

    function handleMouseOver(event, d) {
        tooltip.transition().style("opacity", 1);
    }

    function handleMouseMove(event, d) {
        const [x, y] = d3.pointer(event);
            tooltip.html(`<strong>Year:</strong> ${d.Year}<br>
                <strong>Imports:</strong> $${format(d.Imports)}<br>
                <strong>Exports:</strong> $${format(d.Exports)}<br>
                <strong>Trade Balance:</strong> $${format(Math.abs(d.Exports - d.Imports))}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
    }

    function handleMouseOut(event, d) {
        tooltip.transition().style("opacity", 0);
    }

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(function(number) {
        var formatted = d3.format("$.2s")(number);
        return formatted.replace(/G/, "B");
      });


    chart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "14px");

    chart.append("g")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "14px");

    // Add axis labels
    // chart.append("text")
    //     .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top})`)
    //     .style("text-anchor", "middle")
    //     .text("Year")
    //     .style("font-size", "18px")
    //     .style("fill", "white");

    // chart.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left / 2)
    //     .attr("x", 0 - (chartHeight / 2))
    //     .attr("dy", "1em")
    //     .style("text-anchor", "middle")
    //     .text("Amount ($)")
    //     .style("font-size", "18px")
    //     .style("fill", "white");

    // Add legend
    var ordinal = d3.scaleOrdinal()
        .domain(["Imports", "Exports"])
        .range([colorbrewer.PuBu[9][5], colorbrewer.OrRd[9][5]]);

    svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(" + (width + 20) + "," + 50 + ")");

    var legendOrdinal = d3.legendColor()
        .shape("circle")
        .shapePadding(15)
        .scale(ordinal);

    svg.select(".legendOrdinal")
        .style("fill", "white")
        .call(legendOrdinal);

    // Add legend title
    svg.select(".legendOrdinal")
        .append("text")
        .attr("x", -10)
        .attr("y", -30)
        .attr("text-anchor", "start")
        .style("font-size", "16px")
        .style("fill", "white")
        .text("Type");
});
}

build();
document.getElementById("reloadButton").addEventListener("click", build);