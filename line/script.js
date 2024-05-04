// Set up the SVG container
const width = 800;
const height = 600;
const margin = { top: 50, right: 50, bottom: 100, left: 100 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

function build() {
d3.select("#line svg").remove();

const svg = d3.select("#line")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Annotations
const annotations = [
    {
        note: {
            title: 'Stagnant Increase',
            label: 'Considering inflation, the minimum wage lost buying power over time'
        },
        x: 700,
        y: 75,
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
d3.csv("line/data.csv").then(data => {
    // Convert numeric strings to numbers
    data.forEach(d => {
        d.Year = +d.Years;
        d.MinimumWage = +d["Federal minimum wage ($)"];
    });

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.MinimumWage)])
        .range([chartHeight, 0]);

    // Define the line functions
    const lineMinimumWage = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.MinimumWage));

    // Add line for MinimumWage
    chart.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#8cff79")
        .attr("stroke-width", 2)
        .attr("d", lineMinimumWage)
        .transition()
        .duration(1000)
        .attrTween("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return function(t) {
                return (d3.interpolateString("0," + length, length + "," + length))(t);
            };
        });

    chart.selectAll("circle.MinimumWage")
        .data(data)
        .enter()
        .filter((d, i) => i === 0 || i === data.length - 1 || d.MinimumWage !== data[i - 1].MinimumWage)
        .append("circle")
        .attr("class", "MinimumWage")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.MinimumWage))
        .attr("fill", "#8cff79")
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

    function handleMouseOver(event, d) {
        tooltip.transition().style("opacity", 1);
    }

    function handleMouseMove(event, d) {
        const [x, y] = d3.pointer(event);
            tooltip.html(`<strong>Year:</strong> ${d.Year}<br>
                <strong>Minimum Wage:</strong> ${d3.format("$.2f")(d.MinimumWage)}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
    }

    function handleMouseOut(event, d) {
        tooltip.transition().style("opacity", 0);
    }

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format("$.3s"));

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
    //     .attr("y", 0 - margin.left + 25)
    //     .attr("x", 0 - (chartHeight / 2))
    //     .attr("dy", "1em")
    //     .style("text-anchor", "middle")
    //     .text("Amount ($)")
    //     .style("font-size", "18px")
    //     .style("fill", "white");
});
}

build();
document.getElementById("reloadButton").addEventListener("click", build);
