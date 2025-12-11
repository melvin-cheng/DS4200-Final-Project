d3.csv("Data Model - Pizza Sales.csv").then(function(rawData) {

    // PROCESS RAW DATA (NO AGGREGATION)
    const data = rawData.map(d => ({
        name: d.pizza_name,
        price: parseFloat(d.unit_price),
        category: d.pizza_category,
        size: d.pizza_size,
        quantity: +d.quantity
    }));

    // SIZE → CIRCLE RADIUS SCALE
    const sizeScale = d3.scaleOrdinal()
        .domain(["S", "M", "L", "XL", "XXL"])
        .range([4, 6, 9, 12, 15]);   // bigger pizza → bigger circle

    // CATEGORY COLOR SCALE
    const colorScale = d3.scaleOrdinal()
        .domain(["Chicken", "Classic", "Supreme", "Veggie"])
        .range(["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"]);

    // SVG SETUP
    const margin = {top: 50, right: 50, bottom: 70, left: 70};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X SCALE - Price
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.price))
        .range([0, width])
        .nice();

    // Y SCALE - Quantity (popularity)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.quantity)])
        .range([height, 0])
        .nice();

    // AXES
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => "$" + d));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // AXIS LABELS
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Unit Price ($)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Quantity Ordered");

    // TOOLTIP
    const tooltip = d3.select(".tooltip");

    // SCATTER PLOT POINTS
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.price))
        .attr("cy", d => yScale(d.quantity))
        .attr("r", d => sizeScale(d.size))
        .attr("fill", d => colorScale(d.category))
        .style("opacity", 0.65)
        .style("stroke", "white")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1)
                .attr("stroke", "#333")
                .attr("stroke-width", 2);

            tooltip.style("display", "block")
                .html(`
                    <strong>${d.name}</strong><br>
                    Size: ${d.size}<br>
                    Category: ${d.category}<br>
                    Price: $${d.price}<br>
                    Quantity: ${d.quantity}
                `)
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 12) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.65)
                .attr("stroke", "white");

            tooltip.style("display", "none");
        });

    // TITLE
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Pizza Price vs Quantity Ordered (by Size & Category)");

    // LEGEND
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 10)`);

    const categories = ["Chicken", "Classic", "Supreme", "Veggie"];

    legend.append("text")
        .attr("y", -5)
        .style("font-size", "13px")
        .style("font-weight", "bold")
        .text("Category");

    categories.forEach((cat, i) => {
        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", 15 + i * 22)
            .attr("r", 6)
            .style("fill", colorScale(cat));

        legend.append("text")
            .attr("x", 25)
            .attr("y", 20 + i * 22)
            .style("font-size", "12px")
            .text(cat);
    });

}).catch(function(error) {
    console.log("Error loading CSV:", error);
});
