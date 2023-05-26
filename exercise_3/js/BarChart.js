export class BarChart {
    constructor(_config, _data){
        this.config = {
            parentElement: _config.parentElement,
            colorScale: _config.colorScale,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 600,
            margin: _config.margin || {top: 5, right: 30, bottom: 50, left: 180} 
          }
          this.data = _data;
          this.origindata = _data;
          this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.categories = ["percent_fully", "percent_partly"]

        // Define the position of the chart 
        vis.svg = d3.select("#BarChart")
                    .append("svg")
                    .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
                    .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Create a scale for x-axis 
        vis.xScale = d3.scaleLinear()
                    .domain([0, d3.max(vis.data, d=>d.total_percent)]) // data 마다 바꿔야할덧 max 값 준 담에
                    .range([0, vis.width])
                    .nice();
        
        // Create a scale for y-axis
        vis.yScale = d3.scaleBand()
                        .domain(vis.data.map(d => d.location)) // data 마다 바꿔야할덧 max 값 준 담에
                        .range([0, vis.height])
                        .padding(0.2);

        // Define the position of each axis
        vis.xAxis = d3.axisBottom(vis.xScale).tickFormat(d=>d*100);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Define a scale for color 
        vis.cScale = d3.scaleOrdinal()
            .range(['#7bccc4','#2b8cbe'])
            .domain(vis.categories)

        vis.xAxisGroup = vis.svg.append("g")
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${vis.height})`)

        vis.yAxisGroup = vis.svg.append("g")
            .attr('class', 'y-axis')

        // Indicate the x-axis label 
        vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", vis.width)
            .attr("y", vis.height + 20)
            .attr("font-family", "Arial")
            .attr("font-size", 12)
            .text("Share of people (%)");
            
        // Legend    
        const legend = d3.select("#legend")
        .append("svg")
        .attr('width', vis.width)
        .attr('height', 70)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
        legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2b8cbe")
        legend.append("text").attr("x", 18).attr("y", 18).text("The rate of fully vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
        legend.append("text").attr("x", 18).attr("y", 36).text("The rate of partially vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');  

    }

    updateVis(){
        let vis = this;

        // Generate the data for a stacked bar chart
        vis.stackedData = d3.stack().keys(vis.categories)(vis.data)

        // is.xValue = d => d.data.location;
        // vis.yValue = d => d[0];
        
        // vis.line = d3.line()
        //     .x(d => vis.xScale(vis.xValue(d)))
        //     .y(d => vis.yScale(vis.yValue(d)));

        // Set the scale input domains
        vis.xScale.domain([0, d3.max(vis.data, d=>d.total_percent)]);
        vis.yScale.domain(vis.data.map(d => d.location));

        vis.renderVis()
    }

    renderVis(){
        let vis = this;

        vis.svg.selectAll("rect").remove();
        vis.svg.selectAll(".rect-label").remove();
        
        // Draw the bars
        vis.svg.append("g")
            .selectAll("g")
            .data(vis.stackedData)
            .join("g")
                .attr("fill", d => vis.cScale(d.key))
            .selectAll("rect")
                .data(d => d)
                .join("rect")
                    .attr("y", d => vis.yScale(d.data.location))
                    .attr("x", d => vis.xScale(d[0]))
                    .attr("width", d => vis.xScale(d[1]) - vis.xScale(d[0]))
                    .attr("height",vis.yScale.bandwidth())
        
        // Draw the labels for bars
        vis.svg.append("g")
                .attr("fill", "black")
                .attr("text-anchor", "end")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
            .selectAll("g")
            .data(vis.stackedData)
            .join("g")
            .selectAll("text")
            .data(d=>d)
            .join("text")
                .attr("class","rect-label")
                .attr("x", d => vis.xScale(d[1]))
                .attr("y", d => vis.yScale(d.data.location) + vis.yScale.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("dx", function(d){
                    if(d[0]==d.data.percent_fully){
                        return +20
                    }else {
                        return -4
                    }
                })
                .text(d=>d3.format(".0%")(d[1]-d[0]))
        

        vis.xAxisGroup 
            .transition()
            .duration(500)
            .call(vis.xAxis);

        vis.yAxisGroup
            .transition()
            .duration(500)
            .call(vis.yAxis)
    }
}
