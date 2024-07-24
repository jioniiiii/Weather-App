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
        console.log('Weather data:', weatherData.resolvedAddress);
        this.address = JSON.stringify(weatherData.resolvedAddress);
        console.log(this.address);
        display();
    } else {
        outputElement.textContent = 'Unable to retrieve weather data. Please check the location and try again.';
    }
});

function Data(address) {
    this.address = address;
}

function display() {
    outputElement.innerHTML = this.address;
}