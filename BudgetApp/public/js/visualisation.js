'use strict'

function testJSON(text) {
    if (typeof text !== "string") {
        return false;
    }
    try {
        JSON.parse(text);
        return true;
    } catch (error) {
        return false;
    }
}

function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

document.addEventListener('DOMContentLoaded', function () {
    const xp = document.getElementById('expenses-data').textContent;
    const decodedData = decodeHtmlEntities(xp);
    const expenses = JSON.parse(decodedData);

    const totalBudgetElement = document.getElementById('total-budget');
    if (!totalBudgetElement) {
        console.error('Total budget element not found');
        return;
    }
    const totalBudget = parseFloat(totalBudgetElement.textContent);

    const categories = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const data = Object.entries(categories).map(([key, value]) => ({ category: key, value }));

    // Calculate total expenses
    const totalExpenses = Object.values(categories).reduce((total, amount) => total + amount, 0);

    // Create data array for stacked bar chart
    const stackedData = [
        { category: "Total Expenses", value: totalExpenses },
        ...data
    ];

    ////////////////////////////////////////////
    // Pie Chart

    const width = 450;
    const height = 450;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const svgPie = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const colorPie = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeSet3); // Adjust the color scheme as per your preference

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const pie = d3.pie()
        .value(d => d.value);

    const data_ready_pie = pie(data);

    svgPie.selectAll('slices')
        .data(data_ready_pie)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => colorPie(d.data.category))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (event, d) {
            tooltipPie.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipPie.html(`<strong>${d.data.category}</strong><br>Value: ${d.data.value}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltipPie.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svgPie.selectAll('slices')
        .data(data_ready_pie)
        .enter()
        .append('text')
        .text(d => `${d.data.category}: ${d.data.value}`)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "white");

    // Tooltip for Pie Chart
    const tooltipPie = d3.select("#pie-chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    ////////////////////////////////////////////
    // Bar Chart

    const barWidth = 600;
    const barHeight = 400;
    const barMargin = { top: 30, right: 30, bottom: 60, left: 60 };

    const barSvg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom)
        .append("g")
        .attr("transform", `translate(${barMargin.left},${barMargin.top})`);

    // X axis
    const x = d3.scaleBand()
        .domain(stackedData.map(d => d.category))
        .range([0, barWidth])
        .padding(0.2);

    barSvg.append("g")
        .attr("transform", `translate(0,${barHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    // Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d.value)])
        .nice()
        .range([barHeight, 0]);

    barSvg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    barSvg.selectAll(".bar")
        .data(stackedData)
        .enter().append("rect")
        .attr("x", d => x(d.category))
        .attr("y", d => y(d.value))
        .attr("height", d => barHeight - y(d.value))
        .attr("width", x.bandwidth())
        .attr("fill", d => d.category === "Total Expenses" ? "#f94144" : "#577590")
        .on("mouseover", function (event, d) {
            const tooltip = d3.select(".tooltip");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<strong>${d.category}</strong><br>Value: ${d.value.toFixed(2)}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            const tooltip = d3.select(".tooltip");
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Title
    barSvg.append("text")
        .attr("x", (barWidth / 2))
        .attr("y", 0 - (barMargin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Expenses and Total Budget");

    // Tooltip for Bar Chart
    d3.select("#bar-chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Legend
    const legend = barSvg.selectAll(".legend")
        .data(["Expenses", "Total Expenses"])
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", barWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => d === "Total Expenses" ? "#f94144" : "#577590");

    legend.append("text")
        .attr("x", barWidth - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
});
