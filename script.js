let chartInstance = null;

// Load valid city names from a JSON file or API
let validLocations = [];

async function loadValidLocations() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json');
        validLocations = await response.json();
    } catch (error) {
        console.error("Error loading location data:", error);
    }
}

// Function to check if input is a valid city
function isValidLocation(input) {
    return validLocations.some(loc => loc.name.toLowerCase() === input.toLowerCase());
}

// Fetch weather data only if the input is valid
async function getWeatherData(location) {
    const apiKey = "44b66bbb72cd546198c7c08426c0ed11";
    
    if (!isValidLocation(location)) {
        alert("Invalid city or country. Please enter a correct location.");
        return;
    }

    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=5&appid=${apiKey}`;

    try {
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            throw new Error("Location not found. Please enter a valid city.");
        }

        const { lat, lon, name, country } = geoData[0];

        // Fetch Weather Data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.name) {
            throw new Error("Weather data not found for this location.");
        }

        // Display Weather Data
        document.getElementById('cityName').textContent = `${name}, ${country}`;
        document.getElementById('weatherDescription').textContent = weatherData.weather[0].description;
        document.getElementById('temperature').textContent = `Temperature: ${weatherData.main.temp}°C`;
        document.getElementById('humidity').textContent = `Humidity: ${weatherData.main.humidity}%`;
        document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

        // Fetch Forecast Data
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        const hourlyLabels = forecastData.list.slice(0, 8).map(item => new Date(item.dt * 1000).getHours() + ":00");
        const hourlyTemps = forecastData.list.slice(0, 8).map(item => item.main.temp);

        createHourlyTempChart(hourlyLabels, hourlyTemps);

        document.getElementById('weatherData').style.display = 'block';
        document.getElementById('chartContainer').style.display = 'block';
    } catch (error) {
        document.getElementById('errorMessage').textContent = `Error: ${error.message}`;
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('weatherData').style.display = 'none';
        document.getElementById('chartContainer').style.display = 'none';
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function createHourlyTempChart(labels, temperatures) {
    if (chartInstance !== null) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById('tempChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: '#ff6f61',
                backgroundColor: 'rgba(255, 111, 97, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

document.getElementById('getWeatherBtn').addEventListener('click', function() {
    let location = document.getElementById('city').value.trim();

    if (!location || location.length < 3) {
        alert('Please enter a valid city  with at least 3 characters.');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('weatherData').style.display = 'none';
    document.getElementById('chartContainer').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    getWeatherData(location);
});

// Load valid locations on page load
loadValidLocations();
