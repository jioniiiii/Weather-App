const outputElement = document.getElementById('output');
const form = document.getElementById('weather-form');
const search = document.querySelector('.search-icon');
const tempSwitch = document.getElementById('tempSwitch');
const addressInput = document.getElementById('address');
const locationElem = document.querySelector('.location');
const weatherIconElem = document.querySelector('.weather-icon');
const degreesElem = document.querySelector('.degrees');
const descriptionElem = document.querySelector('.description');
const feelsLikeTextElem = document.querySelector('.feelslikeText');
const feelsLikeElem = document.querySelector('.feelslike');
const humidityTextElem = document.querySelector('.humidityText');
const humidityElem = document.querySelector('.humidity');
const probRainTextElem = document.querySelector('.probRainText');
const probRainElem = document.querySelector('.probRain');
const windTextElem = document.querySelector('.windText');
const windElem = document.querySelector('.wind');
const dateElem = document.querySelector('.date');
const timeElem = document.querySelector('.time');
const timezoneElem = document.querySelector('.timezone');

//local storage
let weatherData = null;
//image flag so it doesnt load when display reloads
let imgFlag = true;

//for time displaying because api doesnt have excat time but time the data was pulled 
let now = new Date();
let hours = now.getHours();
let minutes = now.getMinutes();
let formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

//fetching weather data
async function getWeather(loc) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${loc}/?key=A3P4BNCJFTAKTVZYHEEB2WMNP`

    try {
        const response = await fetch(url);
        if(!response.ok){
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } 
    catch(err) {
        console.error(err);
      };
}

//search box
form.addEventListener('submit', handleFormSubmit);
search.addEventListener('click', handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault();
    const location = addressInput.value;
    if (!location) {
        console.error('No location entered');
        return;
    }
    console.log('Searching for weather data for location:', location);
    addressInput.value = '';  //clear input
    weatherData = await getWeather(location);
    if (weatherData) {
        const dataObject = processData(weatherData);
        display(dataObject);
        imgFlag = true;
    } else {
        outputElement.textContent = 'Unable to retrieve weather data. Please check the location and try again.';
    }
}

function display(dataObject) {
    const { currentTemp, feelTemp } = updateTemp(dataObject);
    //info top
    locationElem.textContent = dataObject.currentL.charAt(0).toUpperCase() + dataObject.currentL.slice(1).toLowerCase();
    loadInfoImg(dataObject.currentCondition);
    degreesElem.textContent = currentTemp;
    descriptionElem.textContent = dataObject.desc;
    //extra info
    loadExtraImg();
    feelsLikeTextElem.textContent = `Feels Like`;
    feelsLikeElem.textContent = feelTemp;
    humidityTextElem.textContent = `Humidity`;
    humidityElem.textContent = `${dataObject.humidity}%`;
    probRainTextElem.textContent = `Chance of Rain`;
    probRainElem.textContent = `${dataObject.probRain}%`;
    windTextElem.textContent = `Wind Speed`;
    windElem.textContent = `${dataObject.wind} km/h`;
    //ino bottom
    dateElem.textContent = `${dataObject.date}`;
    timeElem.textContent = `${formattedTime}`;
    timezoneElem.textContent = `${dataObject.timezone}`;
}

function processData(weatherData) {
    const currentConditions = weatherData.currentConditions;
    const today = weatherData.days[0];

    const myData = {
        currentL: weatherData.address,
        humidity: currentConditions.humidity,
        wind: currentConditions.windspeed,
        probRain: today.precipprob,
        desc: today.conditions,
        date: today.datetime,
        timezone: weatherData.timezone,
        currentCondition: currentConditions.conditions,

        currentT: {
            c: roundTo((currentConditions.temp - 32) * 5/9, 1),
            f: currentConditions.temp
        },
        feelsLike: {
            c: roundTo((currentConditions.feelslike - 32) * 5/9, 1),
            f: currentConditions.feelslike
        }
    }

    return myData;
}

//toggle switch logic
function updateTemp(dataObject) {
    if(tempSwitch.checked) {
        return {
            currentTemp: `${dataObject.currentT.c}°C`,
            feelTemp: `${dataObject.feelsLike.c}°C`
        };
    }
    else {
        return {
            currentTemp: `${dataObject.currentT.f}°F`,
            feelTemp: `${dataObject.feelsLike.f}°F`
        };
    }
}

tempSwitch.addEventListener('change', () => {
    if (weatherData) { 
        const dataObject = processData(weatherData);
        const { currentTemp, feelTemp } = updateTemp(dataObject);
        degreesElem.textContent = currentTemp;
        feelsLikeElem.textContent = feelTemp;
    }
});

//for svgs
function loadInfoImg(condition) {
    
    if(imgFlag){

        const icons = {
            "Clear": "img/SVG/sun.svg",
            "Sunny": "img/SVG/sun.svg",
            "Partially cloudy": "img/SVG/cloud.svg",
            "Rain, Partially cloudy": "img/SVG/rainy.svg",
            "Mostly sunny": "img/SVG/cloud.svg",
            "Partly sunny": "img/SVG/cloud.svg",
            "Cloudy": "img/SVG/cloudy-day.svg",
            "Overcast": "img/SVG/cloudy-day.svg",
            "Mostly cloudy": "img/SVG/cloudy.svg",
            "Rain": "img/SVG/rainy.svg",
            "Showers": "img/SVG/rainy.svg",
            "Drizzle": "img/SVG/rainy.svg",
            "Light rain": "img/SVG/rainy.svg",
            "Heavy rain": "img/SVG/lightning.svg",
            "Thunderstorms": "img/SVG/lightning.svg",
            "Thundershowers": "img/SVG/lightning.svg",
            "Snow": "img/SVG/snow.svg",
            "Light snow": "img/SVG/snow.svg",
            "Heavy snow": "img/SVG/snow.svg",
            "Snow showers": "img/SVG/snow.svg",
            "Fog": "img/SVG/mist.svg",
            "Mist": "img/SVG/mist.svg",
            "Haze": "img/SVG/mist.svg",
            "Windy": "img/SVG/wind.svg",
            "Stormy": "img/SVG/lightning.svg",
            "Blizzard": "img/SVG/snow.svg",
            };
        
            console.log(`Current condition: ${condition}`);
            loadImage(weatherIconElem, icons[condition]);
    }
}

function loadExtraImg() {
    if(imgFlag) {
        const icons = {
            temp: 'img/SVG/thermo.svg',
            humidity: 'img/SVG/humidity.svg',
            wind: 'img/SVG/wind.svg',
            rain: 'img/SVG/rainy.svg',
        };

        Object.keys(icons).forEach(key => {
            loadImage(document.querySelector(`.${key}-icon`), icons[key]);
        });

        imgFlag = false;
    }
}

function loadImage(container, src) {
    container.innerHTML = ''; 
    const img = document.createElement('img');
    img.src = src;
    container.appendChild(img);
}

//for orunding temp
function roundTo(num, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}