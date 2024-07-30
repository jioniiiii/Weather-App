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

//local storage
let weatherData = null;
//image flag so it doesnt load when display reloads
let imgFlag = true;

//for time displaying because api doesnt have excat time but time the data was pulled 
let now = new Date();
let hours = now.getHours();
let minutes = now.getMinutes();
let formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

//for loading screen
function showLoading() {
    loadingDisplay.style.display = 'flex';
    outputElementCont.style.display = 'none';  
}

function hideLoading() {
    loadingDisplay.style.display = 'none';
    outputElementCont.style.display = 'flex';
}

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
        imgFlag = true;
    } 
    else {
        outputElement.textContent = 'Unable to retrieve weather data. Please check the location and try again.';
    }
}

function display(dataObject) {
    const { currentTemp, feelTemp } = updateTemp(dataObject);
    //info top
    locationElem.textContent = dataObject.currentL.charAt(0).toUpperCase() + dataObject.currentL.slice(1).toLowerCase();
    loadImage(weatherIconElem, loadInfoImg(dataObject.icon0));
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

//toggle switch logic
function updateTemp(dataObject) {
    if(tempSwitch.checked) {
        return {
            currentTemp: `${dataObject.currentT.c}°C`,
            feelTemp: `${dataObject.feelsLike.c}°C`,
            tMax: `${dataObject.forecasts[1].tMax.c}°C`,
            tMin: `${dataObject.forecasts[1].tMin.c}°C`
        };
    }
    else {
        return {
            currentTemp: `${dataObject.currentT.f}°F`,
            feelTemp: `${dataObject.feelsLike.f}°F`,
            tMax: `${dataObject.forecasts.days.tMax.f}°F`,
            tMin: `${dataObject.forecasts.days.tMin.f}°F`,
        };
    }
}

tempSwitch.addEventListener('change', () => {
    const tempHighDiv = document.querySelector('.temp-high');
    const tempLowDiv = document.querySelector('.temp-low');
    if (weatherData) { 
        const dataObject = processData(weatherData);
        const { currentTemp, feelTemp, tMax, tMin} = updateTemp(dataObject);
        degreesElem.textContent = currentTemp;
        feelsLikeElem.textContent = feelTemp;
        tempHighDiv.textContent = tMax;
        tempLowDiv.textContent = tMin;
    }
});

//for svgs
function loadInfoImg(condition) {
    
    if(imgFlag){

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
        
           return icons[condition];
    }
}

function loadExtraImg() {
    if(imgFlag) {
        const icons = {
            temp: 'img/svg/thermo.svg',
            humidity: 'img/svg/humidity.svg',
            wind: 'img/svg/wind.svg',
            rain: 'img/svg/rainy.svg',
        };

        Object.keys(icons).forEach(key => {
            loadImage(document.querySelector(`.${key}-icon`), icons[key]);
        });

        imgFlag = false;
    }
}

//to laod the svgs
function loadImage(container, src) {
    container.innerHTML = ''; 
    const img = document.createElement('img');
    img.src = src;
    container.appendChild(img);
}

//for days card
function displayForecast(dataObject) {
    const { tMax, tMin } = updateTemp(dataObject);//check this 
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
        tempHighDiv.textContent = `${tMax}`;
        
        const tempLowDiv = document.createElement('div');
        tempLowDiv.classList.add('temp-low');
        tempLowDiv.textContent = `${tMin}`;
        
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
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];    
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
}