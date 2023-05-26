var country = []
d3.csv('data/life_expectancy_by_country.csv')
	.then(data => {
        for(var i=0; i<data.length; i++){
            let name = data[i].country_name
            let value = data[i].value

            if(country[name]){
                let cur = country[name]
                cur.age.push({year : data[i].year, value: data[i].value})
                if(cur.min > value) { 
                    cur.min = value
                    cur.sub = cur.max - cur.min
                }
                if(cur.max < value) {
                    cur.max = value
                    cur.sub = cur.max - cur.min
                }   
            } else {
                country[name] = {
                    age : [{year : data[i].year, value: data[i].value}],
                    min : 10000, 
                    max : 0, 
                    sub : -1
                }
            }
        }
        minmax = []

        for(con in country){
            minmax.push({country_name : con, sub : country[con].sub})
        }

        minmax = minmax.sort((a, b) => {
            return b.sub - a.sub
        })

        minmax = minmax.slice(0,5)

        processedData = []
        minmax.forEach(element => {
            processedData.push({country_name:element.country_name, value: country[element.country_name].age})
        });

        console.log(processedData)
        // Draw the line chart 
        drawLineChart(processedData);

	})
 	.catch(error => {
        console.error(error);
        console.error('Error loading the data');
});

function drawLineChart(data){
    const margin = {top: 5, right: 100, bottom: 50, left: 50},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
    .append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
                    .domain([1960, 2020])
                    .range([margin.left, width]);

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
                    .domain([0, 80])
                    .range([height, margin.top]);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d => `${d.toString()}`);
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    const xAxisGroup = svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    const yAxisGroup = svg.append("g")
        .attr('class', 'y-axis')
        .call(yAxis)

    // Define a scale for color 
    const cScale = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']

    // Draw the line
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value))

    svg.append("svg")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .datum( (d,index) => data[index])
        .attr("fill", "none")
        .attr("stroke", (d, index) => cScale[index])
        .attr("stroke-width", 1)
        .attr("d", d=>line(d.value))

    svg.append("svg")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")   
        .datum( (d,index) => data[index])
		.attr("transform", d=>"translate(" + (width + 5) + "," + yScale(d.value[60].value) + ")")
        .attr("font-size", "15")
		.attr("text-anchor", "start")
		.style("fill", (d, index) => cScale[index])
		.text(d=>d.country_name);

    xAxisGroup.selectAll("text").enter()
    yAxisGroup.selectAll("text").enter()

    
    // Draw the labels for lines
 
}
