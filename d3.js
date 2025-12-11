d3.csv("Data Model - Pizza Sales.csv").then(function(rawData) {

    // group by pizza name & size
    const pizzaSizeMap = {};

    rawData.forEach(function(row) {
        const pizzaName = row.pizza_name;
        const size = row.pizza_size;
        const price = parseFloat(row.unit_price);
        const quantity = parseInt(row.quantity);

        const key = pizzaName + " | Size: " + size;

        if (!pizzaSizeMap[key]) {
            pizzaSizeMap[key] = {
                name: pizzaName,
                size: size,
                totalOrders: 0,
                totalPrice: 0,
                priceCount: 0,
                category: row.pizza_category
            };
        }

        pizzaSizeMap[key].totalOrders += quantity;
        pizzaSizeMap[key].totalPrice += price;
        pizzaSizeMap[key].priceCount += 1;
    });

    // convert dictionary to array for plotting
    const data = Object.values(pizzaSizeMap).map(d => ({
        name: d.name,
        size: d.size,
        avgPrice: d.totalPrice / d.priceCount,
        orders: d.totalOrders,
        category: d.category
    }));

// jitter
data.forEach(d => {
    d.jitter = (Math.random() - 0.5) * 2.0; 
});

    console.log("POINT COUNT:", data.length);

    // CHART SETUP
    const margin = {top: 40, right: 40, bottom: 80, left: 80};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xMin = d3.min(data, d => d.avgPrice) - 2;
    const xMax = d3.max(data, d => d.avgPrice) + 2;
    const yMax = d3.max(data, d => d.orders) + 500;

    const xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(["Chicken", "Classic", "Supreme", "Veggie"])
        .range(["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => "$" + d.toFixed(2)));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Average Price ($)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Total Orders");

    // Tooltip reference
    const tooltip = d3.select(".tooltip");

    // Draw circles
    const circles = svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.avgPrice))
        .attr("cy", d => yScale(d.orders))
        .attr("r", 6.5)   // slightly smaller since more points now
        .style("fill", d => colorScale(d.category))
        .style("opacity", 0.75)
        .style("stroke", "white")
        .style("stroke-width", "2px")
        .style("cursor", "pointer");

    // Hover interactions
    circles.on("mouseover", function(event, d) {
        d3.select(this)
            .attr("r", 10)
            .style("opacity", 1)
            .style("stroke", "#333");

        tooltip.style("display", "block")
            .html(`
                <strong>${d.name}</strong><br>
                Size: ${d.size}<br>
                Category: ${d.category}<br>
                Avg Price: $${d.avgPrice.toFixed(2)}<br>
                Total Orders: ${d.orders.toLocaleString()}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    });

    circles.on("mouseout", function() {
        d3.select(this)
            .attr("r", 6.5)
            .style("opacity", 0.75)
            .style("stroke", "white");

        tooltip.style("display", "none");
    });

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -15)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Pizza Price vs Popularity (Includes Sizes)");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 120}, 20)`);

    const categories = ["Chicken", "Classic", "Supreme", "Veggie"];

    legend.append("text")
        .attr("x", 0)
        .attr("y", -5)
        .style("font-weight", "bold")
        .style("font-size", "12px")
        .text("Category:");

    categories.forEach((category, i) => {
        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", 15 + i * 20)
            .attr("r", 6)
            .style("fill", colorScale(category))
            .style("opacity", 0.75);

        legend.append("text")
            .attr("x", 22)
            .attr("y", 19 + i * 20)
            .style("font-size", "11px")
            .text(category);
    });

}).catch(function(error) {
    console.log("Error loading the CSV file:", error);
});
