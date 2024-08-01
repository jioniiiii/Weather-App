const outputElementCont = document.getElementById('output-cont');
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
const loadingDisplay = document.getElementById('loading');
const cardsCont = document.querySelector('.forecast-cont');

//local storage
let weatherData = null;

//for time displaying because api doesnt have excat time but time the data was pulled 
let now = new Date();
let hours = now.getHours();
let minutes = now.getMinutes();
let formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

//for loading screen
function showLoading() {
    loadingDisplay.style.display = 'flex';
    outputElementCont.style.display = 'none';  
    cardsCont.style.display = 'none';  
}

function hideLoading() {
    loadingDisplay.style.display = 'none';
    outputElementCont.style.display = 'flex';
    cardsCont.style.display = 'flex';  
}

//fetching weather data
async function getWeather(loc) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${loc}/?key=A3P4BNCJFTAKTVZYHEEB2WMNP`//proper solution for security server-side call
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
      }
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

    showLoading();

    console.log('Searching for weather data for location:', location);
    addressInput.value = '';  //clear input
    weatherData = await getWeather(location);
    if (weatherData) {
        const dataObject = processData(weatherData);
        hideLoading();
        displayForecast(dataObject);
        display(dataObject);
    } 
    else {
        outputElement.textContent = 'Unable to retrieve weather data. Please check the location and try again.';
    }
}

function display(dataObject) {
    //info top
    locationElem.textContent = dataObject.currentL.charAt(0).toUpperCase() + dataObject.currentL.slice(1).toLowerCase();
    loadImage(weatherIconElem, loadInfoImg(dataObject.icon0));
    degreesElem.textContent = tempSwitch.checked ? `${dataObject.currentT.c}°C` : `${dataObject.currentT.f}°F`;
    descriptionElem.textContent = dataObject.desc;
    //extra info
    loadExtraImg();
    feelsLikeTextElem.textContent = `Feels Like`;
    feelsLikeElem.textContent = tempSwitch.checked ? `${dataObject.feelsLike.c}°C` : `${dataObject.feelsLike.f}°F`;
    humidityTextElem.textContent = `Humidity`;
    humidityElem.textContent = `${dataObject.humidity}%`;
    probRainTextElem.textContent = `Chance of Rain`;
    probRainElem.textContent = `${dataObject.probRain}%`;
    windTextElem.textContent = `Wind Speed`;
    windElem.textContent = `${dataObject.wind} km/h`;
    //ino bottom
    dateElem.textContent = `${dataObject.date0}`;
    timeElem.textContent = `${formattedTime}`;
    timezoneElem.textContent = `${dataObject.timezone}`;
}

function processData(weatherData) {
    const currentConditions = weatherData.currentConditions;
    const days = weatherData.days;
    

    const myData = {
        //general
        currentL: weatherData.address,
        timezone: weatherData.timezone,
        //for today
        icon0: days[0].icon, 
        humidity: currentConditions.humidity,
        wind: currentConditions.windspeed,
        probRain: days[0].precipprob,
        desc: days[0].conditions,
        date0: days[0].datetime,
        currentCondition: currentConditions.conditions,

        currentT: {
            c: roundTo((currentConditions.temp - 32) * 5/9, 1),
            f: currentConditions.temp
        },
        feelsLike: {
            c: roundTo((currentConditions.feelslike - 32) * 5/9, 1),
            f: currentConditions.feelslike
        },
        //for the next 6 days
        forecasts: days.slice(1, 7).map(day => ({
            date: day.datetime,
            tMax: {
                c: roundTo((day.tempmax - 32) * 5/9, 1),
                f: day.tempmax
            },
            tMin: {
                c: roundTo((day.tempmin - 32) * 5/9, 1),
                f: day.tempmin
            },
            icon: day.icon
        }))
    }

    return myData;
}

//toggle switch 
tempSwitch.addEventListener('change', () => {
    if (weatherData) { 
        const dataObject = processData(weatherData);
        display(dataObject); 
        displayForecast(dataObject);
    }
});

//for svgs
function loadInfoImg(condition) {
    let now = new Date();
    let hour = now.getHours();
    let isNight = hour >= 20 || hour < 6;

    const icons = {
        "clear-day": "img/svg/sun.svg",
        "wind": "img/svg/wind.svg",
        "cloudy": "img/svg/cloudy.svg",
        "rain": "img/svg/rainy.svg",
        "partly-cloudy-day": "img/svg/cloudy-day.svg",
        "snow-showers-day": "img/svg/snow-showers-day.svg",
        "thunder-rain": "img/svg/lightning.svg",
        "thunder-showers-day": "img/svg/tlightning.svg",
        "showers-day": "img/svg/rainy.svg",
        "snow": "img/svg/snow.svg",
        "fog": "img/svg/fog.svg",
        };

    const nightIcons = {
        "clear-night": "img/svg/moon.svg",
        "cloudy-night": "img/svg/cloudy-night.svg",
    };
        
    return isNight ? nightIcons[condition] || nightIcons["cloudy-night"] : icons[condition] || icons["cloudy"];
}

function loadExtraImg() {

    const icons = {
        temp: 'img/svg/thermo.svg',
        humidity: 'img/svg/humidity.svg',
        wind: 'img/svg/wind.svg',
        rain: 'img/svg/rainy.svg',
    };

    Object.keys(icons).forEach(key => {
        loadImage(document.querySelector(`.${key}-icon`), icons[key]);
    });
    
}

//to laod the svgs
function loadImage(container, src) {
    container.innerHTML = ''; 
    const img = document.createElement('img');
    img.src = src;
    img.onerror = () => console.error(`Failed to load image: ${src}`);
    container.appendChild(img);
}

//for days card
function displayForecast(dataObject) {
    const forecastContainer = document.querySelector('.forecast-cont'); 

    forecastContainer.innerHTML = '';

    dataObject.forecasts.forEach(day => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = getDayOfWeek(day.date); 
        
        const tempDiv = document.createElement('div');
        tempDiv.classList.add('temp');
        
        const tempHighDiv = document.createElement('div');
        tempHighDiv.classList.add('temp-high');
        tempHighDiv.textContent = tempSwitch.checked ? `${day.tMax.c}°C` : `${day.tMax.f}°F`;
        
        const tempLowDiv = document.createElement('div');
        tempLowDiv.classList.add('temp-low');
        tempLowDiv.textContent = tempSwitch.checked ? `${day.tMin.c}°C` : `${day.tMin.f}°F`;
        
        tempDiv.appendChild(tempHighDiv);
        tempDiv.appendChild(tempLowDiv);
        
   
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('icon-forecast');
        loadImage(iconDiv,loadInfoImg(day.icon));
  
        card.appendChild(dayDiv);
        card.appendChild(tempDiv);
        card.appendChild(iconDiv);
        
        forecastContainer.appendChild(card);
    });
}

//for orunding temp
function roundTo(num, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}

//for finding the dya of the week
function getDayOfWeek(dateStr) {
    const date = new Date(dateStr);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];    
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
}