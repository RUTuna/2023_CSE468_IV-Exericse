export class BubbleChart {
    constructor(_config, _data, year){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || window.innerWidth - 300,
            containerHeight: _config.containerHeight || window.innerHeight - 100,
            margin: _config.margin || {top: 5, right: 100, bottom: 50, left: 100}
          }
        this.data = _data;
        this.countries = _data.map(d => d.country);
        this.year = year;
        
        this.initVis();
        this.updateVis();
    } 
    
    initVis(){
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
            .nice();

        vis.yScale = d3.scaleLinear()
            .range([0, vis.height])
            .nice();

        vis.zScale = d3.scaleLinear()
            .domain([2646, 7888408686])
            .range([4, 10])

        vis.cScale = d3.scaleOrdinal()
            .domain(vis.countries)
            .range(d3.schemeSet2);

        vis.xAxis = d3.axisBottom(vis.xScale)
        vis.yAxis = d3.axisLeft(vis.yScale)


        vis.xAxisGroup = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        

        vis.yAxisGroup = vis.svg.append('g')
            .attr('class', 'axis y-axis');

        vis.svg.append("text")
            .attr("text-anchor", "center")
            .attr("x", vis.width/2)
            .attr("y", vis.height + 40)
            .attr("font-size", 12)
            .text("Life Expectancy");

        vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", -vis.height/2)
            .attr("y", -40)
            .attr("font-size", 12)
            .attr("transform", "rotate(-90)")
            .text("Fertility Rate");


    }


    updateVis() {
        let vis = this;

        // Set the scale input domains
        vis.xScale.domain([0, d3.max(vis.data, d=>d.life_expectancy)]);
        vis.yScale.domain([d3.max(vis.data, d=>d.fertility_rate), 0]);
        // vis.zScale.domain([d3.min(vis.data, d=>d.population), d3.max(vis.data, d=>d.population)]).range([4, 10])

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis.svg.selectAll("circle").remove();
        
        vis.svg.append('g')
            .selectAll("dot")
            .data(vis.data)
            .enter()
            .append("circle")
                .attr("class", "bubbles")
                .attr("cx", function (d) { return vis.xScale(d.life_expectancy); } )
                .attr("cy", function (d) { return vis.yScale(d.fertility_rate); } )
                .attr("r", function (d) { return vis.zScale(d.population); } )
                .style("fill", function (d) { return vis.cScale(d.country); } )
                // -3- Trigger the functions
                .on('mouseover', (event,d) => {
                    d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX+10) + 'px')   
                    .style('top', (event.pageY+10) + 'px')
                    .html(`
                        <div class="tooltip-title">${d.country}</div>
                        <ul>
                            <li>fertility rate: ${d.fertility_rate}</li>
                            <li>life_expectancy: ${d.life_expectancy}</li>
                        </ul>
                    `);
                })
                .on('mouseleave', () => {
                    d3.select('#tooltip').style('display', 'none');
                });
            
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