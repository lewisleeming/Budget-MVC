'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const summaryDataEl = document.getElementById('summary-data');
    if (!summaryDataEl || !window.d3) return;

    let summary;
    try {
        summary = JSON.parse(summaryDataEl.textContent);
    } catch (e) {
        console.error('Failed to parse summary data for charts:', e);
        return;
    }

    renderCategoryPieChart(summary);
    renderMonthlyComparisonChart(summary);
    renderSpendingTrendChart(summary);
});

/**
 * 1. Category Spending Donut Chart
 */
function renderCategoryPieChart(summary) {
    const container = document.getElementById('chart-pie');
    if (!container) return;
    container.innerHTML = '';

    const data = (summary.categoryBreakdown || [])
        .filter((c) => c.spent > 0)
        .map((c) => ({ label: c.category, value: c.spent }));

    if (data.length === 0) {
        container.innerHTML = '<div class="chart-empty">No expense data recorded this month.</div>';
        return;
    }

    const width = container.clientWidth || 360;
    const height = 280;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;
    const innerRadius = radius * 0.55; // Donut chart

    const svg = d3
        .select('#chart-pie')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.label))
        .range([
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#ec4899',
            '#06b6d4',
            '#84cc16',
            '#6366f1',
            '#14b8a6'
        ]);

    const pie = d3
        .pie()
        .value((d) => d.value)
        .sort(null);

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

    const arcHover = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(radius + 6);

    const tooltip = createChartTooltip('#chart-pie');

    const slices = svg
        .selectAll('.slice')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'slice');

    slices
        .append('path')
        .attr('d', arc)
        .attr('fill', (d) => color(d.data.label))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
            d3.select(this).transition().duration(150).attr('d', arcHover);
            const total = d3.sum(data, (item) => item.value);
            const pct = ((d.data.value / total) * 100).toFixed(1);
            tooltip
                .style('opacity', 1)
                .html(`<strong>${d.data.label}</strong><br>£${d.data.value.toFixed(2)} (${pct}%)`);
        })
        .on('mousemove', function (event) {
            const [x, y] = d3.pointer(event, container);
            tooltip.style('left', x + 15 + 'px').style('top', y - 15 + 'px');
        })
        .on('mouseout', function () {
            d3.select(this).transition().duration(150).attr('d', arc);
            tooltip.style('opacity', 0);
        });

    // Center text showing total expense
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .style('font-size', '12px')
        .style('fill', '#64748b')
        .text('Total Spent');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#0f172a')
        .text(`£${summary.monthlyExpense.toFixed(2)}`);
}

/**
 * 2. 6-Month Income vs Expenses Comparison Chart
 */
function renderMonthlyComparisonChart(summary) {
    const container = document.getElementById('chart-bar');
    if (!container) return;
    container.innerHTML = '';

    const history = summary.sixMonthHistory || [];
    if (history.length === 0) {
        container.innerHTML = '<div class="chart-empty">No comparison history available.</div>';
        return;
    }

    const margin = { top: 20, right: 20, bottom: 40, left: 55 };
    const width = (container.clientWidth || 360) - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    const svg = d3
        .select('#chart-bar')
        .append('svg')
        .attr(
            'viewBox',
            `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const months = history.map((d) => d.month);
    const subGroups = ['income', 'expense'];

    const x0 = d3.scaleBand().domain(months).range([0, width]).padding(0.25);

    const x1 = d3.scaleBand().domain(subGroups).range([0, x0.bandwidth()]).padding(0.08);

    const maxVal = d3.max(history, (d) => Math.max(d.income, d.expense, 100));
    const y = d3
        .scaleLinear()
        .domain([0, maxVal * 1.1])
        .range([height, 0]);

    // Gridlines
    svg.append('g')
        .attr('class', 'chart-grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    // X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickFormat((d) => d.slice(5))) // show MM part
        .selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#64748b');

    // Y Axis
    svg.append('g')
        .call(
            d3
                .axisLeft(y)
                .ticks(5)
                .tickFormat((d) => '£' + d)
        )
        .selectAll('text')
        .style('font-size', '10px')
        .style('fill', '#64748b');

    const colors = { income: '#10b981', expense: '#ef4444' };
    const tooltip = createChartTooltip('#chart-bar');

    const monthGroups = svg
        .selectAll('.month-group')
        .data(history)
        .enter()
        .append('g')
        .attr('class', 'month-group')
        .attr('transform', (d) => `translate(${x0(d.month)},0)`);

    monthGroups
        .selectAll('rect')
        .data((d) => subGroups.map((key) => ({ key, value: d[key], month: d.month })))
        .enter()
        .append('rect')
        .attr('x', (d) => x1(d.key))
        .attr('y', (d) => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', (d) => Math.max(0, height - y(d.value)))
        .attr('fill', (d) => colors[d.key])
        .attr('rx', 3)
        .on('mouseover', function (event, d) {
            tooltip
                .style('opacity', 1)
                .html(
                    `<strong>${d.month}</strong><br>${d.key.toUpperCase()}: £${d.value.toFixed(2)}`
                );
        })
        .on('mousemove', function (event) {
            const [x, yCoord] = d3.pointer(event, container);
            tooltip.style('left', x + 15 + 'px').style('top', yCoord - 15 + 'px');
        })
        .on('mouseout', function () {
            tooltip.style('opacity', 0);
        });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${width - 130}, -10)`);

    [
        ['Income', '#10b981'],
        ['Expense', '#ef4444']
    ].forEach(([label, colorVal], i) => {
        const item = legend.append('g').attr('transform', `translate(${i * 65}, 0)`);
        item.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', colorVal)
            .attr('rx', 2);
        item.append('text')
            .attr('x', 14)
            .attr('y', 9)
            .text(label)
            .style('font-size', '10px')
            .style('fill', '#64748b');
    });
}

/**
 * 3. Daily Cumulative Spending Trend Area Chart
 */
function renderSpendingTrendChart(summary) {
    const container = document.getElementById('chart-trend');
    if (!container) return;
    container.innerHTML = '';

    const trends = summary.spendingTrends || [];
    if (trends.length === 0) {
        container.innerHTML =
            '<div class="chart-empty">No daily transactions recorded for this month.</div>';
        return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = (container.clientWidth || 700) - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const svg = d3
        .select('#chart-trend')
        .append('svg')
        .attr(
            'viewBox',
            `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Compute cumulative spending
    let runningTotal = 0;
    const cumulativeData = trends.map((d) => {
        runningTotal += d.amount;
        return {
            date: new Date(d.date),
            daily: d.amount,
            cumulative: runningTotal,
            dateStr: d.date
        };
    });

    const x = d3
        .scaleTime()
        .domain(d3.extent(cumulativeData, (d) => d.date))
        .range([0, width]);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(cumulativeData, (d) => d.cumulative) * 1.15 || 100])
        .range([height, 0]);

    // Gridlines
    svg.append('g')
        .attr('class', 'chart-grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    // Area generator
    const area = d3
        .area()
        .x((d) => x(d.date))
        .y0(height)
        .y1((d) => y(d.cumulative))
        .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.cumulative))
        .curve(d3.curveMonotoneX);

    // Gradient fill
    const defs = svg.append('defs');
    const gradient = defs
        .append('linearGradient')
        .attr('id', 'trend-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
    gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3b82f6')
        .attr('stop-opacity', 0.35);
    gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#3b82f6')
        .attr('stop-opacity', 0.0);

    svg.append('path').datum(cumulativeData).attr('fill', 'url(#trend-gradient)').attr('d', area);

    svg.append('path')
        .datum(cumulativeData)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2.5)
        .attr('d', line);

    // X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%d %b')))
        .selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#64748b');

    // Y Axis
    svg.append('g')
        .call(
            d3
                .axisLeft(y)
                .ticks(5)
                .tickFormat((d) => '£' + d)
        )
        .selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#64748b');

    const tooltip = createChartTooltip('#chart-trend');

    // Scatter points with tooltips
    svg.selectAll('.dot')
        .data(cumulativeData)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.date))
        .attr('cy', (d) => y(d.cumulative))
        .attr('r', 4)
        .attr('fill', '#3b82f6')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
            d3.select(this).attr('r', 6).attr('fill', '#1d4ed8');
            tooltip
                .style('opacity', 1)
                .html(
                    `<strong>${d.dateStr}</strong><br>Day spend: £${d.daily.toFixed(2)}<br>Cumulative: £${d.cumulative.toFixed(2)}`
                );
        })
        .on('mousemove', function (event) {
            const [xCoord, yCoord] = d3.pointer(event, container);
            tooltip.style('left', xCoord + 15 + 'px').style('top', yCoord - 15 + 'px');
        })
        .on('mouseout', function () {
            d3.select(this).attr('r', 4).attr('fill', '#3b82f6');
            tooltip.style('opacity', 0);
        });
}

function createChartTooltip(selector) {
    d3.select(selector).select('.chart-tooltip').remove();
    return d3.select(selector).append('div').attr('class', 'chart-tooltip').style('opacity', 0);
}
