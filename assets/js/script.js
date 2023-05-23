// Get the form and input elements
const form = document.getElementById("city-form");
const input = document.getElementById("city-input");

// Get the sections where the weather data will be displayed
const currentWeatherEl = document.getElementById("current-weather");
const forecastEl = document.getElementById("forecast");
const searchHistoryEl = document.getElementById("search-history");

// const submitBtn = document.getElementById("submit");

// Store searched city
var city = "";

// Add an event listener to the form to handle submissions
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the form from submitting

  // Get the city name from the input field
  city = input.value.trim();

  // Clear the input field
  input.value = "";

  // Set up API Key
  const APIKey = "6e4307f49ddd0749f21a1909e4149678";
  fetchWeather(APIKey, city);

  console.log("button was clicked")
});


// Fetch weather data for the city 
function fetchWeather(APIKey, city) {
    const geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${APIKey}`;
    const geoResponsePromise = fetch(geoURL);

    // Handles fetch response by checking for errors and parsing the JSON data
    const geoDataPromise = geoResponsePromise.then(response => {
        if(!response.ok) {
            throw response.json();
        }
        return response.json();
    });

    // Fetch city coordinates 
    const coordPromise = geoDataPromise.then(json => {
        return {
            lat: json[0].lat,
            lon: json[0].lon,
        };
    });

    // Fetch weather using coordinates
    const weatherPromise = coordPromise.then(({lat, lon}) => {
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}`;
        const weatherResponsePromise = fetch(weatherURL);
        return weatherResponsePromise;
    });

    const weatherData = weatherPromise.then(response => {
        if(!response.ok) {
            throw response.json();
        }
        return response.json();
    });

    // Console.log to check the response
    weatherData.then(data => {
        console.log("Weather Data:", data);
        displayWeather(data);
    }).catch(error => {
        console.log("Error fetching weather data:", error);
    });

    return weatherData;
}

        

//Display weather
function displayWeather(weatherData) {
    const cityEl = document.getElementById("city");
    const dateEl = document.getElementById("date");
    const iconEl = document.getElementById("icon");
    const temperatureEl = document.getElementById("temperature");
    const humidityEl = document.getElementById("humidity");
    const windspeedEl = document.getElementById("windspeed");

    // Convert temperature from Kelvin to Fahrenheit and drops the decimal using Math.floor
    const tempFahrenheit = Math.trunc(Number(weatherData.main.temp - 273.15) * 9/5 + 32);

    // Convert windspeed from meters per second to miles per hour
    const windSpeedMPH = Math.trunc(Number(weatherData.wind.speed * 2.23694));

    // Update the elements with the weather data
    cityEl.textContent = weatherData.name;
    dateEl.textContent = new Date(weatherData.dt * 1000).toLocaleDateString();
    iconEl.src = `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;
    temperatureEl.textContent = tempFahrenheit.toFixed(2) + " °F";
    humidityEl.textContent = weatherData.main.humidity + "%";
    windspeedEl.textContent = windSpeedMPH.toFixed(2) + " MPH";

} 

// Add event listener for search history section

