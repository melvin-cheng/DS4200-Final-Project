d3.csv("Data Model - Pizza Sales.csv").then(function(rawData) {

    // group data by pizza and size
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

    // convert to array
    const data = Object.values(pizzaSizeMap).map(d => ({
        name: d.name,
        size: d.size,
        avgPrice: d.totalPrice / d.priceCount,
        orders: d.totalOrders,
        category: d.category
    }));

    // jitter
    data.forEach(d => {
        d.jitter = (Math.random() - 0.5) * 0.4;
    });

    console.log("POINT COUNT:", data.length);

    // size to radius scale
    const radiusScale = d3.scaleOrdinal()
        .domain(["S", "M", "L", "XL"])
        .range([5, 7, 9, 11]);


    // set up chart area
    const margin = {top: 40, right: 150, bottom: 80, left: 80};
    const width = 900 - margin.left - margin.right;
    const height = 520 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // scales
    const xMin = d3.min(data, d => d.avgPrice) - 1;
    const xMax = d3.max(data, d => d.avgPrice) + 1;
    const yMax = d3.max(data, d => d.orders) + 300;

    const xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);

    // warm color palette
    const colorScale = d3.scaleOrdinal()
        .domain(["Chicken", "Classic", "Supreme", "Veggie"])
        .range(["#d1495b", "#edae49", "#f9df74", "#b5651d"]);


    // axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => "$" + d.toFixed(2)));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 55)
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text("Average Price ($)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -55)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text("Total Orders");

    // add tooltip
    const tooltip = d3.select(".tooltip");

    // draw circles
    const circles = svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.avgPrice + d.jitter))
        .attr("cy", d => yScale(d.orders))
        .attr("r", d => radiusScale(d.size))
        .style("fill", d => colorScale(d.category))
        .style("opacity", 0.65)
        .style("stroke", "white")
        .style("stroke-width", "2px")
        .style("cursor", "pointer");

    // hover
    circles.on("mouseover", function(event, d) {
        d3.select(this)
            .attr("r", radiusScale(d.size) + 3)
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
            .style("left", (event.pageX + 12) + "px")
            .style("top", (event.pageY - 20) + "px");
    });

    circles.on("mouseout", function() {
        d3.select(this)
            .attr("r", d => radiusScale(d.size))
            .style("opacity", 0.65)
            .style("stroke", "white");

        tooltip.style("display", "none");
    });

    // title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-weight", "bold")
        .text("Pizza Price vs Popularity (Includes Sizes)");

    // category legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 10)`);

    legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-weight", "bold")
        .style("font-size", "13px")
        .text("Category:");

    ["Chicken", "Classic", "Supreme", "Veggie"].forEach((cat, i) => {
        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", 20 + i * 22)
            .attr("r", 7)
            .style("fill", colorScale(cat));

        legend.append("text")
            .attr("x", 28)
            .attr("y", 25 + i * 22)
            .style("font-size", "12px")
            .text(cat);
    });

    // size legend
    const sizeLegend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 120)`);

    sizeLegend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-weight", "bold")
        .style("font-size", "13px")
        .text("Size:");

    ["S", "M", "L", "XL"].forEach((s, i) => {
        sizeLegend.append("circle")
            .attr("cx", 10)
            .attr("cy", 20 + i * 22)
            .attr("r", radiusScale(s))
            .style("fill", "#dddddd")
            .style("stroke", "#555");

        sizeLegend.append("text")
            .attr("x", 28)
            .attr("y", 25 + i * 22)
            .style("font-size", "12px")
            .text(s);
    });

}).catch(function(error) {
    console.log("Error loading the CSV file:", error);
});
