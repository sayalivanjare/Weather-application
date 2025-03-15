let chartInstance = null;

async function getWeatherData(city) {
    const apiKey = "44b66bbb72cd546198c7c08426c0ed11";
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    try {
        // Get correct city coordinates
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            throw new Error("City not found. Please enter a valid city.");
        }

        const { lat, lon, name } = geoData[0];

        // Fetch Weather Data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.name) {
            throw new Error("Weather data not found for this city.");
        }

        document.getElementById('cityName').textContent = name;
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
    let city = document.getElementById('city').value.trim();

    // Prevent empty, too short, or invalid city names
    if (!city || city.length < 2 || city.toLowerCase() === "abc") {
        alert('Please enter a valid city name.');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('weatherData').style.display = 'none';
    document.getElementById('chartContainer').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    getWeatherData(city);
});
