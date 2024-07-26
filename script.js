const outputElement = document.getElementById('output');
const form = document.getElementById('weather-form');
const search = document.querySelector('.search-icon');
const tempSwitch = document.getElementById('tempSwitch');

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
form.addEventListener('submit', async (event) => {
    event.preventDefault(); //prevent reload
    let location = document.getElementById('address').value;
    if (!location) {
        console.error('No location entered');
        return;
    }
    console.log('Searching for weather data for location:', location);
    const weatherData = await getWeather(location);
    if (weatherData) {
        const dataObject = processData(weatherData);
        display(dataObject);
    } else {
        outputElement.textContent = 'Unable to retrieve weather data. Please check the location and try again.';
    }
})

//so search icon can trigger form event linstener
search.addEventListener('click', (event) => {
    event.preventDefault();
    let submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
})

function display(dataObject) {
    document.querySelector('.location').textContent = dataObject.currentL;
    document.querySelector('.degrees').textContent = updateTemp(dataObject);
    document.querySelector('.description').textContent = ` ${dataObject.desc}`;
    document.querySelector('.feelslikeText').textContent = `Feels Like`;
    document.querySelector('.feelslike').textContent = updateTemp(dataObject);
    document.querySelector('.humidityText').textContent = `Humidity`;
    document.querySelector('.humidity').textContent = `${dataObject.humidity}%`;
    document.querySelector('.probRainText').textContent = `Chance of Rain`;
    document.querySelector('.probRain').textContent = `${dataObject.probRain}%`;
    document.querySelector('.windText').textContent = `Wind Speed`;
    document.querySelector('.wind').textContent = `${dataObject.wind} km/h`;
    document.querySelector('.date').textContent = `${dataObject.date}`;
    document.querySelector('.time').textContent = `${formattedTime}`;
    document.querySelector('.timezone').textContent = `${dataObject.timezone}`;
}

function processData(weatherData) {
    const currentConditions = weatherData.currentConditions;
    console.log(currentConditions)
    const today = weatherData.days[0];

    const myData = {
        currentL: weatherData.address,
        humidity: currentConditions.humidity,
        wind: currentConditions.windspeed,
        probRain: today.precipprob,
        desc: today.conditions,
        date: today.datetime,
        timezone: weatherData.timezone,


        feelsLike: {
            c: Math.round((currentConditions.temp - 32) * 5/9),
            f: currentConditions.feelslike
        },
        currentT: {
            c: Math.round((currentConditions.temp - 32) * 5/9),
            f: currentConditions.feelslike
        }
    }

    console.log(myData);
    return myData;
}

//toggle switch logic
function updateTemp(dataObject) {
    if(tempSwitch.checked) {
        let currentTemp = `${dataObject.feelsLike.c}°C`;
        return currentTemp
    }
    else {
        let feelTemp =  `${dataObject.feelsLike.f}°F`;
        return feelTemp
    }
}

tempSwitch.addEventListener('change', async () => {
    const dataObject = processData(await getWeather(document.getElementById('address').value));
    display(dataObject);
});