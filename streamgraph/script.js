// Set up the SVG container
const margin = {top: 20, right: 30, bottom: 50, left: 150},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

function build() {
d3.select("#streamgraph svg").remove();

const svg = d3.select("#streamgraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 250)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data from csv
d3.csv("streamgraph/data.csv", function(d) {
    return {
        // Parse data
        "Years": d3.timeParse("%Y")(d.Years),
        "Goods": +d.Goods,
        "Services": +d.Services,
        "Investments": +d.Investments,
        "Federal Government": +d["Federal Government"],
        "State and Local Government": +d["State and Local Government"]
    };
}).then(function(data) {
    // List of groups = header of the csv files
    const keys = Object.keys(data[0]).slice(1);

    // Add x axis
    const x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.Years; }))
        .range([0, width]);

    // Append the x axis to the SVG
    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height*0.8})`)
        .call(d3.axisBottom(x).tickSize(-height*.7).tickFormat(d3.timeFormat("%Y")));

    xAxis.selectAll(".tick text")
        .attr("font-size", 12)
        .attr("transform", "translate(0, 20)");

    // Add y axis
    const y = d3.scaleLinear()
        .domain([-15000000000000, 15000000000000])
        .range([height - 106.66, 50]);
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(7).tickSize(-width).tickFormat(function(number) {
            var formatted = d3.format(".2s")(number);
            return formatted.replace(/G/, "B");
          })).selectAll("text").attr("font-size", 12);

    // Add y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 2)
        .attr("x", 0 - (height / 2) + margin.top)
        .attr("dy", "1em")
        .attr("font-size", 18)
        .style("text-anchor", "middle")
        .text("Relative GDP ($)")
        .style("fill", "white");

    // Color palette
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range([colorbrewer.Set2[5][0], colorbrewer.Set2[5][1], colorbrewer.Set2[5][2], colorbrewer.Set2[5][3], colorbrewer.Set2[5][4]]);

    // Stack the data
    const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (data);

    // Create tooltip
    const tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 18)
        .style("fill", "white");

    const verticalLine = svg
        .append("line")
        .attr("class", "verticalLine")
        .style("stroke", "white")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "5")
        .style("opacity", 0);

    const mouseover = function(event, d) {
        tooltip.style("opacity", 1);
        d3.selectAll(".myArea").style("opacity", .2);
        d3.select(this)
            .style("stroke", "white")
            .style("opacity", 1);
    };
    const mousemove = function(event, d, i) {
        const grp = d.key;
        const xPos = d3.pointer(event, this)[0];
        const date = x.invert(xPos);
        const bisectDate = d3.bisector(d => d.Years).left;
        const index = bisectDate(data, date, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        const dateDifference = date - d0.Years > d1.Years - date ? d1 : d0;
        const year = d3.timeFormat("%Y")(date);
        const value = dateDifference[grp];
        tooltip.text(null);
        tooltip.append("tspan")
            .text(`${grp}: $${format(value)}`)
            .attr("font-size", 18);
        tooltip.append("tspan")
            .text(`${year}`)
            .attr("x", xPos)
            .attr("text-anchor", "middle")
            .attr("dy", "30")
            .attr("font-size", 14);
        verticalLine.attr("x1", xPos)
            .attr("y1", 50)
            .attr("x2", xPos)
            .attr("y2", height - 100)
            .style("opacity", 1);
    };
    const mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
        verticalLine.style("opacity", 0);
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none");
    };

    // Define clipping path with upper and lower bounds
    const upperBound = height - 107.5;
    const lowerBound = 52.5;
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", upperBound - lowerBound)
        .attr("y", lowerBound);

    // Create a group for the areas and apply clipping
    const areas = svg.append("g")
        .attr("clip-path", "url(#clip)");

    // Generate areas
    const area = d3.area()
        .x(function(d) { return x(d.data.Years); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); });

    areas.selectAll(".mylayers")
        .data(stackedData)
        .join("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 15])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        // Update y scale and redraw y-axis
        const newYScale = event.transform.rescaleY(y);
        svg.select(".y-axis").call(d3.axisLeft(newYScale).ticks(7).tickSize(-width).tickFormat(function(number) {
            var formatted = d3.format(".2s")(number);
            return formatted.replace(/G/, "B");
          })).selectAll("text").attr("font-size", 12);

        // Update areas based on new y scale, don't go outside x and y axis bounds
        svg.selectAll(".myArea")
            .attr("d", d3.area()
                .x(function(d) { return x(d.data.Years); })
                .y0(function(d) { return newYScale(d[0]); })
                .y1(function(d) { return newYScale(d[1]); }));
    }

    // Add legend
    var ordinal = d3.scaleOrdinal()
        .domain(["State and Local Government", "Federal Government", "Investments", "Services", "Goods"])
        .range([colorbrewer.Set2[5][4], colorbrewer.Set2[5][3], colorbrewer.Set2[5][2], colorbrewer.Set2[5][1], colorbrewer.Set2[5][0]]);

    svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(" + (width + 50) + "," + 100 + ")");

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
        .text("GDP Components");

    var format = number => (d3.format(".3s")(number).replace(/T/, " Trillion").replace(/G/, " Billion").replace(/M/, " Million").replace(/k/, " Thousand"));
});
}

build();
document.getElementById("reloadButton").addEventListener("click", build);