const apiKey = '#'; // OpenWeatherMap API key provided by user ( # )

// DOM Elements
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const weatherContent = document.querySelector('.weather-content');
const loader = document.querySelector('.loader-container');
const errorToast = document.querySelector('.error-toast');

const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const cityName = document.querySelector('.city-name');
const dateElement = document.querySelector('.date');

// Details
const humidity = document.querySelector('.humidity');
const windSpeed = document.querySelector('.wind-speed');
const pressure = document.querySelector('.pressure');
const feelsLike = document.querySelector('.feels-like');
const sunrise = document.querySelector('.sunrise');
const sunset = document.querySelector('.sunset');
const visibility = document.querySelector('.visibility');
const cloudiness = document.querySelector('.cloudiness');

const forecastContainer = document.querySelector('.forecast-container');

// Event Listeners
searchButton.addEventListener('click', getWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});

// Initial Entrance Animation
gsap.from('.header', { duration: 1, y: -50, opacity: 0, ease: 'power3.out' });

// Main function to fetch weather
async function getWeather() {
    const city = searchInput.value.trim();
    if (!city) return;

    // Show Loader with animation
    gsap.to(weatherContent, { duration: 0.3, opacity: 0, y: 20, pointerEvents: 'none' });
    loader.style.display = 'flex';
    gsap.from(loader, { opacity: 0, duration: 0.3 });

    try {
        console.log(`Fetching weather for: ${city}`);
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Weather API error:', errorData);
            throw new Error(errorData.message || 'City not found');
        }
        const data = await response.json();

        console.log('Weather data received:', data);

        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        
        let forecastData;
        if (!forecastRes.ok) {
            const forecastError = await forecastRes.json();
            console.error('Forecast API error:', forecastError);
            // Even if forecast fails, we might still want to show current weather
            // or handle it gracefully. For now, let's just proceed with an empty list
            forecastData = { list: [] };
        } else {
            forecastData = await forecastRes.json();
        }
        console.log('Forecast data received:', forecastData);

        updateUI(data, forecastData);
        
    } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message);
    } finally {
        loader.style.display = 'none';
    }
}

function updateUI(data, forecastData) {
    const city = data.name;
    const weatherMain = data.weather[0].main.toLowerCase();
    
    // Update Dynamic Background based on City Name
    const backgroundOverlay = document.querySelector('.background-overlay');
    // Using a reliable Unsplash Source URL with city and weather keywords
    const dynamicImageUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(city)},${weatherMain},landscape`;
    
    // Create a temporary image to preload
    const img = new Image();
    img.src = dynamicImageUrl;
    img.onload = () => {
        backgroundOverlay.style.backgroundImage = `url('${dynamicImageUrl}')`;
    };
    img.onerror = () => {
        // Fallback to weather-based background classes if Unsplash fails
        document.body.classList.remove('clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist', 'haze', 'smoke', 'drizzle');
        if (['clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist', 'haze', 'smoke', 'drizzle'].includes(weatherMain)) {
            document.body.classList.add(weatherMain);
        } else {
            document.body.classList.add('clear');
        }
    };

    // Fill data
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    dateElement.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    temperature.textContent = `${Math.round(data.main.temp)}°`;
    description.textContent = data.weather[0].description;
    
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    // Details
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    
    const formatTime = (ts) => new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunrise.textContent = formatTime(data.sys.sunrise);
    sunset.textContent = formatTime(data.sys.sunset);
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    cloudiness.textContent = `${data.clouds.all}%`;

    // Forecast
    displayForecast(forecastData);

    // Show Content with GSAP
    weatherContent.style.pointerEvents = 'all';
    gsap.to(weatherContent, { 
        duration: 0.8, 
        opacity: 1, 
        y: 0, 
        ease: 'back.out(1.2)',
        onStart: () => {
            // Staggered animation for cards
            gsap.from('.detail-card', {
                duration: 0.6,
                scale: 0.8,
                opacity: 0,
                stagger: 0.05,
                ease: 'power2.out'
            });
            gsap.from('.forecast-card', {
                duration: 0.6,
                y: 30,
                opacity: 0,
                stagger: 0.1,
                delay: 0.2,
                ease: 'power2.out'
            });
        }
    });
}

function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    if (!data.list || data.list.length === 0) return;

    // Get as many unique days as possible (API gives up to 5/6 unique days usually)
    const dailyData = [];
    const seenDays = new Set();
    const today = new Date().getDate();

    for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const day = date.getDate();
        
        // Take the first entry for each unique day that is NOT today
        if (day !== today && !seenDays.has(day)) {
            dailyData.push(item);
            seenDays.add(day);
        }
        
        if (dailyData.length >= 7) break; 
    }

    // If we have less than 7 days, let's just show what we have (max possible)
    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="day">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="weather">
            <div class="temp">${Math.round(item.main.temp)}°</div>
        `;
        forecastContainer.appendChild(card);
    });
}

function showError(message = 'City not found. Try again!') {
    const errorText = errorToast.querySelector('p');
    errorText.textContent = message;
    errorToast.style.display = 'flex';
    gsap.fromTo(errorToast, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    setTimeout(() => {
        gsap.to(errorToast, { y: 50, opacity: 0, duration: 0.4, onComplete: () => errorToast.style.display = 'none' });
    }, 4000);
}

// Initial Call
document.addEventListener('DOMContentLoaded', () => {
    if (apiKey !== 'YOUR_API_KEY') {
        searchInput.value = 'London';
        getWeather();
    } else {
        gsap.to('.search-box', { boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)', borderColor: '#ef4444', duration: 1, repeat: -1, yoyo: true });
    }
});
