// The svg
const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
    .scale(150)
    .center([0, 0])
    .translate([width / 2, height / 2 + 200]);

// Color scale
const colorScale = d3.scaleLinear()
    .domain([0, 10000, 20000, 30000, 40000, 50000])
    .range(d3.schemeGreens[5]);

// Add legend
svg.append("g")
    .attr("class", "legendLinear color-legend")
    .attr("transform", `translate(${width / 2 - 175}, ${50})`)
    .style("fill", "white");

var legend = d3.legendColor()
    .scale(colorScale)
    .orient('horizontal')
    .cells([0, 10000, 20000, 30000, 40000, 50000])
    .labelAlign('middle')
    .shapePadding(10)
    .shapeWidth(50)
    .labelFormat(d3.format(".1s"))
    .title('GDP per capita ($)');

svg.select(".color-legend")
    .call(legend);

// Load external data and boot
Promise.all([
    d3.json("world-map/geo.json"),
    d3.csv("world-map/data.csv")
]).then(function(loadData){
    let topo = loadData[0];
    let world_data = loadData[1];

    // Populate data map with GDP values
    const gdp_data = new Map(world_data.map(d => [d.code, +d.gdp]));
    const pop_data = new Map(world_data.map(d => [d.code, +d.pop]));
    const name_data = new Map(world_data.map(d => [d.code, d.name]));

    // Tooltip
    const tooltip = d3.select(".tooltip");

    let mouseMove = function(event, d) {
        tooltip.html(`<strong>Country:</strong> ${name_data.get(d.id)}<br><strong>GDP per capita:</strong> $${gdp_data.get(d.id)}<br><strong>Population:</strong> ${pop_data.get(d.id).toLocaleString()}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
    };

    let mouseOver = function(d) {
        d3.selectAll(".Country")
        .transition()
        .duration(500)
        .style("opacity", .3);
        d3.select(this)
        .transition()
        .duration(500)
        .style("opacity", 1)
        tooltip.transition().style("opacity", 1).duration(500);
    };

    let mouseLeave = function(d) {
        d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", 1);
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
        .style("opacity", 1)
        tooltip.transition().style("opacity", 0);
    };

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            d.total = gdp_data.get(d.id) || 0;
            return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", 1)
        .on("mouseover", mouseOver )
        .on("mousemove", function(event, d) { mouseMove(event, d); })
        .on("mouseleave", mouseLeave );
});
