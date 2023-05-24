// Get the form and input elements
const form = document.getElementById("city-form");
const input = document.getElementById("city-input");

// Get the sections where the weather data will be displayed
const currentWeatherEl = document.getElementById("current-weather");
const forecastEl = document.getElementById("forecast");
const searchHistoryEl = document.getElementById("search-history");

// Store searched city
var city = "";

// Set up API Key
const APIKey = "6e4307f49ddd0749f21a1909e4149678";

//
//
// Add an event listener to the form to handle submissions
//
//
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the form from submitting

  // Get the city name from the input field
  city = input.value.trim();

  // Clear the input field
  input.value = "";

  // Save the city to localStorage
  saveCity(city);

  fetchWeather(APIKey, city);
});

//
//
// Save searched cities (10 cities maximum) to localStorage
//
//
function saveCity(city) {
  // Get the existing search history from localStorage or initialize it as an empty array
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // Add the searched city to the search history
  searchHistory.push(city);

  // Limit the search history to 10 saved cities
  const maxEntries = 10;
  if (searchHistory.length > maxEntries) {
    searchHistory.splice(0, searchHistory.length - maxEntries);
  }

  // Save the updated search history to localStorage
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

  // Update the displayed search history
  displaySearchHistory(searchHistory);
}

//
//
// Display search history
//
//
function displaySearchHistory(searchHistory) {
    // Clear the search history section
    searchHistoryEl.innerHTML = "";
  
    // Create and append a button for each city in the search history
    searchHistory.forEach(searchedCity => {
      const btn = document.createElement("button");
      btn.textContent = searchedCity;
      btn.classList.add("btn", "btn-secondary", "mb-2", "p-2", "m-2");
      btn.addEventListener("click", () => {
        // Fetch weather data for the clicked city
        fetchWeather(APIKey, searchedCity);
      });
      searchHistoryEl.appendChild(btn);
    });
}

//
//
// Fetch current weather data for the city
//
//
function fetchWeather(APIKey, city) {
    const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${APIKey}`;
    const geoResponsePromise = fetch(geoURL);

    // Handles fetch response by checking for errors and parsing the JSON data
    const geoDataPromise = geoResponsePromise.then(response => {
        if(!response.ok) {
            throw response.json();
        }
        return response.json();
    });

    //
    // Fetch city coordinates
    //
    const coordPromise = geoDataPromise.then(json => {
        return {
            lat: json[0].lat,
            lon: json[0].lon,
        };
    });

    //
    // Fetch weather using coordinates
    //
    const weatherPromise = coordPromise.then(({lat, lon}) => {
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}`;
        const weatherResponsePromise = fetch(weatherURL);
        return weatherResponsePromise;
    });

    const weatherData = weatherPromise.then(response => {
        console.log("Weather Response:", response);
        if(!response.ok) {
            throw response.json();
        }
        return response.json();
    });

    // Console.log to check the response
    // Call displayWeather()
    weatherData.then(data => {
        console.log("Weather Data:", data);
        displayWeather(data);
    }).catch(error => {
        console.log("Error fetching weather data:", error);
    });

    //
    // Fetch 5-day forecast data
    //
    const forecastPromise = coordPromise.then(({lat, lon}) => {
        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=40&appid=${APIKey}`;
        const forecastResponsePromise = fetch(forecastURL);
        return forecastResponsePromise;
    });

    const forecastData = forecastPromise.then(response => {
        if(!response.ok) {
            throw response.json();
        }
        return response.json();
    });

    // Console.log to check the response
    forecastData.then(data => {
        console.log("Forecast Data:", data);
        displayForecast(data);
    }).catch(error => {
        console.log("Error fetching weather data:", error);
    });

    return weatherData;
}

//
//
// Display current weather
//
//
function displayWeather(weatherData) {
    console.log(currentWeatherEl);
    // Clear existing current weather card
    currentWeatherEl.innerHTML = "";
  
    // Create card elements
    const card = document.createElement("div");
    card.classList.add("card", "current-weather", "mt-4", "col-md-12");
  
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "text-center");
  
    // Create elements for city, date, icon, temperature, humidity, and windspeed
    const cityEl = document.createElement("h2");
    cityEl.classList.add("card-title", "text-secondary");
    cityEl.textContent = weatherData.name;
  
    const dateEl = document.createElement("p");
    dateEl.classList.add("card-text", "text-info");
    dateEl.textContent = new Date(weatherData.dt * 1000).toLocaleDateString();
  
    const iconEl = document.createElement("img");
    iconEl.src = `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;
  
    const tempEl = document.createElement("p");
    tempEl.classList.add("card-text", "text-warning");
    tempEl.textContent = "Temperature: " + Math.trunc(Number(weatherData.main.temp - 273.15) * 9/5 + 32) + " °F";
  
    const humidityEl = document.createElement("p");
    humidityEl.classList.add("card-text", "text-primary");
    humidityEl.textContent = "Humidity: " + weatherData.main.humidity + "%";
  
    const windspeedEl = document.createElement("p");
    windspeedEl.classList.add("card-text", "text-danger");
    windspeedEl.textContent = "Wind Speed: " + Math.trunc(Number(weatherData.wind.speed * 2.23694)) + " MPH";
  
    // Append elements to the card body
    cardBody.appendChild(cityEl);
    cardBody.appendChild(dateEl);
    cardBody.appendChild(iconEl);
    cardBody.appendChild(tempEl);
    cardBody.appendChild(humidityEl);
    cardBody.appendChild(windspeedEl);
  
    // Append card body to the card
    card.appendChild(cardBody);
  
    // Append card to the current weather section
    currentWeatherEl.appendChild(card);
}
  
//
//
// Display 5-day forecast
//
//
function displayForecast(forecastData) {
    // Extract the forecast data from the API response
    const forecasts = forecastData.list;

    // Clear existing forecast cards
    forecastEl.innerHTML = "";

    // Use the forecasts array to populate the forecast cards dynamically
    forecasts.slice(0, 5).forEach(forecast => {
      const card = document.createElement("div");
      card.classList.add("card", "col-md-2", "text-light", "mt-4", "p-2", "m-2", "forecast");
  
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body", "text-center");
  
      const dateEl = document.createElement("h2");
      dateEl.classList.add("card-text", "text-info", "fs-3");
      dateEl.textContent = "Date: " + new Date(forecast.dt * 1000).toLocaleDateString();
  
      const iconEl = document.createElement("img");
      iconEl.src = `http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  
      const tempEl = document.createElement("p");
      tempEl.classList.add("card-text", "text-warning");
      tempEl.textContent = "Temperature: " + Math.trunc(Number(forecast.main.temp - 273.15) * 9/5 + 32) + " °F";
  
      const humidityEl = document.createElement("p");
      humidityEl.classList.add("card-text", "text-primary");
      humidityEl.textContent = "Humidity: " + forecast.main.humidity + "%";
  
      const windspeedEl = document.createElement("p");
      windspeedEl.classList.add("card-text", "text-danger");
      windspeedEl.textContent = "Wind Speed: " + Math.trunc(Number(forecast.wind.speed * 2.23694)) + " MPH";
  
      cardBody.appendChild(dateEl);
      cardBody.appendChild(iconEl);
      cardBody.appendChild(tempEl);
      cardBody.appendChild(humidityEl);
      cardBody.appendChild(windspeedEl);
  
      card.appendChild(cardBody);
      forecastEl.appendChild(card);
    });
}