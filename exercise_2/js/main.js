var newData = [];

// AJ : people_vaccinated
// AK : people_fully_vaccinated

d3.csv('data/owid-covid-data.csv')
	.then(data => {

        /*

        process the data here

        */

        for(let i=0; i<=data.length; i++){
            const cur = data[i];
            if(cur && cur.people_vaccinated && cur.population){
                let curLocData =  newData.find((d) => d.location === cur.location)
                if(curLocData){
                    curLocData.vaccinated = (cur.people_vaccinated - cur.people_fully_vaccinated) / cur.population * 100
                    curLocData.fully_vaccinated = cur.people_fully_vaccinated / cur.population* 100
                } else {
                    curLocData = {location: cur.location}
                    curLocData.vaccinated = (cur.people_vaccinated - cur.people_fully_vaccinated) / cur.population* 100
                    curLocData.fully_vaccinated = cur.people_fully_vaccinated / cur.population* 100
                    newData.push(curLocData)
                }
            }
        }

        newData.sort((a, b) => (b.vaccinated + b.fully_vaccinated) - (a.vaccinated + a.fully_vaccinated))

        newData = newData.filter(cur => (cur.vaccinated + cur.fully_vaccinated) < 100);

        const processedData = newData.slice(0,15)
        // console.log(processedData);

        // draw the stacked bar chart
        drawBarChart(processedData);

	})
 	.catch(error => {
         console.error(error);
	});

function drawBarChart(data){

    const margin = {top: 5, right: 30, bottom: 50, left: 100},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
       .append("svg")
       .attr('width', width + margin.left + margin.right + 100)
       .attr('height', height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define a scale for color 
    const cScale = ['#7bccc4', '#2b8cbe']

    // Generate the data for a stacked bar chart
    var vaccinatedData = data.map(function(group) {
        return { location: group.location, type: "vaccinated", value: group.vaccinated, total: group.vaccinated + group.fully_vaccinated };
      });
    var fullyVaccinatedData = data.map(function(group) {
        return { location: group.location, type: "fully_vaccinated", value: group.fully_vaccinated, total: group.vaccinated + group.fully_vaccinated };
      });

    const stackedData = fullyVaccinatedData.concat(vaccinatedData);


    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
                    .domain([0, d3.max(stackedData, function(d) { return d.value; })])
                    .range([0, width]);

    // Create a scale for y-axis
    const yScale = d3.scaleBand()
                    .domain(stackedData.map(function(group) { return group.location; }))
                    .range([0, height])
                    .padding(0.1);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    svg.append("g")
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

    svg.append("g")
    .attr('class', 'y-axis')
    .call(yAxis)

    
    // Draw the bars
    svg.selectAll("g")
        .data(stackedData)
        .enter()
        .append("g")
        .selectAll("rect")
        .data(stackedData)
        .enter()
        .append("rect")
        .attr("x", function(d) { 
            if (d.type === "vaccinated") {
                return xScale(d.total - d.value);
            } else {
                return 0;
            }
        })
        .attr("y", d=> {return yScale(d.location)})
        .attr("width", function(d) { return xScale(d.value); })
        .attr("height", yScale.bandwidth())
        .attr("margin", (0,5))
        .style("fill", function(d) {
            if (d.type === "vaccinated") {
            return cScale[1];
            } else {
            return cScale[0];
            }
        });

    // groups.append()

    // Draw the labels for bars
    svg.selectAll("g")
        // .data(stackedData)
        // .enter()
        // .append("g")
        .selectAll("text")
        .data(stackedData)
        .enter()
        .append("text")
        .attr("x", function(d) { 
            console.log(d)
            if (d.type === "vaccinated") {
                return xScale(d.total) + 10;
            } else {
                return xScale(d.value) - 25;
            }
        })
        .attr("y", d=> {return yScale(d.location)+(yScale.bandwidth()/2)+5})
        .attr("font-size", 12)
        .text(d => Math.floor(d.value)+"%");

    // Indicate the x-axis label 
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .attr("font-size", 17)
        .text("Share of people (%)");

    // Legend
    const legend = d3.select("#legend")
        .append("svg")
        .attr('width', width)
        .attr('height', 70)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2b8cbe")
    legend.append("text").attr("x", 18).attr("y", 18).text("The rate of fully vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
    legend.append("text").attr("x", 18).attr("y", 36).text("The rate of partially vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');

}
