const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const cityName = document.querySelector('.city-name');
const forecastContainer = document.querySelector('.forecast-container');

// Add event listeners
searchButton.addEventListener('click', getWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});

// Fetch weather data
async function getWeather() {
    const city = searchInput.value.trim();
    if (!city) return;

    try {
        // Get current weather
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid= #`// # = Iske jagah own APiid dalana hai
        );
        const currentWeatherData = await currentWeatherResponse.json();

        if (currentWeatherResponse.status === 404) {
            throw new Error('City not found');
        }

        // Get 7-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid= #`// # = Iske jagah own APiid dalana hai
        );
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentWeatherData);
        displayForecast(forecastData);

    } catch (error) {
        alert('City not found or API error. Please try again.');
        console.error('Error:', error);
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    cityName.textContent = `${data.name}, ${data.sys.country}`;
}

// Display 7-day forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (every 8th item as the API returns 3-hour forecasts)
    const dailyForecasts = data.list.filter((forecast, index) => index % 8 === 0).slice(0, 7);

    dailyForecasts.forEach((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = forecast.weather[0].icon;

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.style.animationDelay = `${index * 0.1}s`;

        forecastDay.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="weather icon">
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="forecast-desc">${forecast.weather[0].description}</div>
        `;

        forecastContainer.appendChild(forecastDay);
    });
}

// Initial weather data for a default city
document.addEventListener('DOMContentLoaded', () => {
    searchInput.value = 'Ambala';
    getWeather();
});