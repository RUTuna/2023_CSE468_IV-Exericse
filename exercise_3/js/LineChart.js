const parseTime = d3.timeParse("%Y-%m-%d");

export class LineChart {
    constructor(_config, _data){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || window.innerWidth - 300,
            containerHeight: _config.containerHeight || window.innerHeight - 100,
            margin: _config.margin || {top: 5, right: 100, bottom: 50, left: 100}
          }
        this.origindata = _data;
        this.data = _data;
        
        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Create a scale for x-axis 
        vis.xScale = d3.scaleTime()
            .range([0, vis.width]);

        // Create a scale for y-axis
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])
            .nice();

        // Define the position of each axis
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d3.timeFormat("%Y-%m")) // x축 눈금 포맷을 연도만 표시하도록 변경


        vis.yAxis = d3.axisLeft(vis.yScale)

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisGroup = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        // Append y-axis group
        vis.yAxisGroup = vis.svg.append('g')
            .attr('class', 'axis y-axis');

        vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", vis.width)
            .attr("y", vis.height + 20)
            .attr("font-family", "Arial")
            .attr("font-size", 12)
            .text("date");

        vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", -20)
            .attr("y", 10)
            .attr("font-family", "Arial")
            .attr("font-size", 12)
            .text("total case");
    }
    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
        let vis = this;

        vis.sumstat = d3.group(vis.data, d => d.location);

        vis.xValue = d => d.year;
        vis.yValue = d => d.total_cases;
        
        vis.line = d3.line()
            .x(d => vis.xScale(vis.xValue(d)))
            .y(d => vis.yScale(vis.yValue(d)))
            .curve(d3.curveNatural);

        // Set the scale input domains
        vis.xScale.domain(d3.extent(vis.data, vis.xValue));
        vis.yScale.domain([0, d3.max(vis.data, vis.yValue)*2]);


        vis.renderVis();
    }

    /**
     * Bind data to visual elements
     */
    renderVis() {
        let vis = this;
        // Add line path

        vis.svg.selectAll(".label").remove();
        vis.svg.selectAll(".chart-line").remove();
        
        vis.svg.selectAll('.chart-line')
            .data(vis.sumstat)
            .join('path')
            .attr("class","chart-line")
            .attr("fill", "none")
            .attr("stroke", function(d){return "#" + Math.round(Math.random() * 0xffffff).toString(16) })
            .attr("stroke-width", 1.5)
            .transition()
            .duration(500)
            .attr('d', d => vis.line(d[1]));

        // Draw the labels for lines
        vis.svg.selectAll(".text")        
            .data(vis.sumstat)
            .enter()
            .append("text")
            .attr("class","label")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("x", function(d) { return vis.xScale(d[1][d[1].length-1].year) + 5; }  )
            .attr("y", function(d) { return vis.yScale(d[1][d[1].length-1].total_cases) - 5; })
            .attr("dy", ".75em")
            .text(function(d) { return d[0]; })
            .transition()
            .duration(500); 
            
        // Update the axes
        vis.xAxisGroup
            .transition()
            .duration(500)
            .call(vis.xAxis);
        vis.yAxisGroup
            .transition()
            .duration(500)
            .call(vis.yAxis);
  }

}