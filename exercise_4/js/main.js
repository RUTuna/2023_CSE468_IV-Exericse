"use strict";
import { BubbleChart } from "./BubbleChart.js";
let files = ["fertility_rate.csv", "life_expectancy.csv", "population.csv"];
const data = {
    fertility_rate: null,
    life_expectancy: null,
    population: null
};
let bubblechart, slider, sliderValue;
let countries = []

Promise.all(files.map(function(filename) {
    return d3.csv("data/" + filename);
})).then(function(result) {
        data.fertility_rate = result[0]; 
        data.life_expectancy = result[1]; 
        data.population = result[2];

        countries = result[0].map(d => d.country);

        let fertility_rate = changeYear(2017);
        bubblechart = new BubbleChart({ parentElement: '#chart'}, fertility_rate, 2017)
        

        slider = document.getElementById("slider");
        sliderValue = document.getElementById("slider_value");
        slider.addEventListener("input", handleSlider);
    })
    .catch(error => {
        console.error('Error loading the data : ', error);
    });

function changeYear(year){
    const processed_data = [];
    data.fertility_rate.forEach(d => {
        if(d[year]){
            const countryData = {
              country: d["Country Name"],
              fertility_rate: d[year],
              life_expectancy: null,
              population: null
            };
            processed_data.push(countryData);
        }
      });
    
      data.life_expectancy.forEach(d => {
        const countryData = processed_data.find(country => country.country === d["Country Name"]);
        if (countryData) {
          countryData.life_expectancy = d[year];
        }
      });
    
      data.population.forEach(d => {
        const countryData = processed_data.find(country => country.country === d["Country Name"]);
        if (countryData) {
          countryData.population = d[year];
        }
      });

    processed_data.sort((a, b) => b.population - a.population); // population 값을 기준으로 내림차순 정렬! 큰 것이 뒤에 그려지게 하기 위함
    return processed_data
}

function handleSlider(e) {
    sliderValue.innerHTML = e.target.value
    bubblechart.data = changeYear(e.target.value);
    bubblechart.updateVis();

}