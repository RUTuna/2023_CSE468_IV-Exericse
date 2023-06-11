"use strict";
import { BubbleChart } from "./BubbleChart.js";
let files = ["fertility_rate.csv", "life_expectancy.csv", "population.csv"];
const data = {
    fertility_rate: null,
    life_expectancy: null,
    population: null
};
let bubblechart;
const slider = document.getElementById("slider"),
      sliderValue = document.getElementById("slider_value"),
      startSlider = document.getElementById("start_slider")
let prevYear = 1960;
const minYear = 1960, maxYear = 2021;
let isAuto = false;
let countries = []

Promise.all(files.map(function(filename) {
    return d3.csv("data/" + filename);
})).then(function(result) {
        data.fertility_rate = result[0]; 
        data.life_expectancy = result[1]; 
        data.population = result[2];

        countries = result[0].map(d => d.country);

        let fertility_rate = changeYear(prevYear);
        bubblechart = new BubbleChart({ parentElement: '#chart'}, fertility_rate, prevYear)

        slider.addEventListener("input", (e)=>handleSlider(e.target));
        startSlider.addEventListener("click", handleStartAnimate)
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
          if(d[year]) countryData.life_expectancy = d[year];
          else processed_data.splice(processed_data.indexOf(countryData), 1)
        } 
        else {
        } 
      });
    
      data.population.forEach(d => {
        const countryData = processed_data.find(country => country.country === d["Country Name"]);
        if (countryData) {
          if(d[year]) countryData.population = d[year];
          else processed_data.splice(processed_data.indexOf(countryData), 1)
        }
      });

    processed_data.sort((a, b) => b.population - a.population); // population 값을 기준으로 내림차순 정렬! 큰 것이 뒤에 그려지게 하기 위함
    return processed_data
}

function handleSlider(target) {
    // 연속적인 전환 위해 step 을 소수 단위로 설정했으나, data 변환은 실제 년도가 바뀔 때만 변환시켜 최적화
    const value = parseInt(target.value)
    if(prevYear != value){
      prevYear = value;
      sliderValue.innerHTML = value
      bubblechart.data = changeYear(value);
      bubblechart.updateVis();
    }
}

function handleStartAnimate(e){
  isAuto = !isAuto
  isAuto ? e.target.setAttribute("CLICKED", '') : e.target.removeAttribute("CLICKED")
}

function animate(){
  requestAnimationFrame(animate);
  if (isAuto & slider.value <= maxYear) {
    slider.value = parseFloat(slider.value) + 0.5
    handleSlider(slider)
    
    if(slider.value >= maxYear) {
      startSlider.removeAttribute("CLICKED");
      isAuto = false;
    }
  }
}

animate();