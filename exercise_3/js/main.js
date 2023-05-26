"use strict";
import { LineChart } from "./LineChart.js";
import { BarChart } from "./BarChart.js";
let data, lineChart, barChart;
let startDate, endDate; 

const parseTime = d3.timeParse("%Y-%m-%d");
let countryLocations, checkboxContainer;
let selectedCountry = []
let dataRange;

d3.csv('data/owid-covid-data.csv')
	.then(_data => {
        _data.map(function(el){
            el["percent_fully"] = el["people_fully_vaccinated"] / el["population"];
            el["total_percent"] = el["people_vaccinated"] / el["population"];
            el["percent_partly"] = el["total_percent"] - el["percent_fully"];
            el["year"] = parseTime(el["date"])
        });

        data = _data;
        startDate = parseTime("2020-01-01")
        endDate = parseTime("2024-01-01")

        const vaccinated = parseBarData(data);
        // console.log(data)
        lineChart = new LineChart({ parentElement: '#LineChart'}, data);
        lineChart.data = filterData(lineChart.origindata);
        lineChart.updateVis();

        barChart = new BarChart({ parentElement: '#BarChart'}, vaccinated.filter(el => el.total_percent <= 1));
        barChart.data = filterData(barChart.origindata)
        barChart.updateVis();


        countryLocations = [...new Set(data.map(d => d.location))];
        checkboxContainer = d3.select("#checkbox-container");

        checkboxContainer
            .selectAll("input")
            .data(countryLocations)
            .enter()
            .append("div")
            .html((d) => `<input type="checkbox" id="${d}-checkbox" value="${d}"><label for="${d}-checkbox">${d}</label>`)
            .on("change", function() { handleCheckbox.call(this); });

        const typeRadio = Array.from(document.getElementsByClassName('chartType'));
        typeRadio.forEach((radio)=>{
            radio.addEventListener('change', e => {
                const type = e.target.value;
                if(type == 'BarChart') {
                    document.getElementById("barChart-container").style.display = "block";
                    document.getElementById("lineChart-container").style.display = "none";
                }
                else {
                    document.getElementById("barChart-container").style.display = "none";
                    document.getElementById("lineChart-container").style.display = "block";
                }

            })
            })
        
        // dataRange = new MultiRangeInput(this, 0, 1, 0.1);
	})
    .catch(error => {
        console.error('Error loading the data : ', error);
    });

d3.select('#start-input').on('focusout', function() {
    // Get selected year
    startDate = parseTime(d3.select(this).property('value'));
    
    // Filter dataset accordingly
    let filteredData = filterData(lineChart.origindata);
    
    // Update chart
    lineChart.data = filteredData;
    lineChart.updateVis();


    barChart.data = parseBarData(filteredData);
    barChart.updateVis();
});

d3.select('#end-input').on('focusout', function() {
    // Get selected year
    endDate = parseTime(d3.select(this).property('value'));
    
    // Filter dataset accordingly
    let filteredData = filterData(lineChart.origindata);
    
    // Update chart
    lineChart.data = filteredData
    lineChart.updateVis();


    barChart.data = parseBarData(filteredData);
    barChart.updateVis();
});

function filterData(data) {
    return data.filter(d => d.year <= endDate).filter(d => d.year >= startDate).filter((d) => selectedCountry.includes(d.location));
}

function parseBarData(data) {
    const share = data.filter(el => el.people_vaccinated & el.people_fully_vaccinated)
    const getRecent = arr => { 
        const res = [], map = {};
     
        arr.forEach(el => {
            //store the index
           if (!(el['location'] in map)) {
              map[el['location']] = res.push(el) - 1;
              return;
           };
           //compare date
           if(res[map[el['location']]]['date'] < el['date']){
              res[map[el['location']]] = el;
           };
        });
        return res;
     };

    const vaccinated = getRecent(share);
    vaccinated.sort(function(a, b){
        return b["total_percent"] - a["total_percent"]
    })

    return vaccinated;
}


function handleCheckbox() {
    // const checkbox = this.getElementByTagName("input")
    let country = this.querySelector("input").value;
    let isChecked = this.querySelector("input").checked;

    // Update selected countries array based on checkbox state
    if (isChecked) {
        selectedCountry.push(country);
    } else {
        const index = selectedCountry.indexOf(country);
        if (index !== -1) {
            selectedCountry.splice(index, 1);
        }
    }

    // Filter data based on selected countries
    const filteredData = filterData(lineChart.origindata);

    // Update chart with filtered data
    lineChart.data = filteredData;
    lineChart.updateVis();

    barChart.data = parseBarData(filteredData);;
    barChart.updateVis();
};