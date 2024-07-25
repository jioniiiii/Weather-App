const outputElement = document.getElementById('output');
const btn = document.getElementById("btn");
const form = document.getElementById('weather-form');

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
});


function display(dataObject) {
    document.querySelector('.location').textContent = dataObject.currentL;
    document.querySelector('.degrees').textContent = `Current Temperature: ${dataObject.currentT.c}°C / ${dataObject.currentT.f}°F`;
    document.querySelector('.description').textContent = `Description: ${dataObject.desc}`;
    document.querySelector('.feelslike').textContent = `Feels Like: ${dataObject.feelsLike.c}°C / ${dataObject.feelsLike.f}°F`;
    document.querySelector('.humidity').textContent = `Humidity: ${dataObject.humidity}%`;
    document.querySelector('.wind').textContent = `Wind Speed: ${dataObject.wind} km/h`;
}

function processData(weatherData) {
    const currentConditions = weatherData.currentConditions;
    const today = weatherData.days[0];

    const myData = {
        currentL: weatherData.resolvedAddress,
        wind: currentConditions.windspeed,
        humidity: currentConditions.humidity,
        desc: currentConditions.description,

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