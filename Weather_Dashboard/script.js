const apiKey = "d9f721a5ccfc62c7f25e9b046eabd08c"; // 🔑 Replace with your OpenWeather API key
let tempUnit = "metric"; // Default Celsius

// Search by city name (input)
async function getWeatherByCity() {
    const cityName = document.getElementById("cityInput").value.trim();
    if (!cityName) {
        alert("Please enter a city name.");
        return;
    }

    try {
        // Step 1: Geocoding API to get coordinates
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)},IN&limit=1&appid=${apiKey}`);
        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            document.getElementById("weatherResult").innerHTML = `<p style="color:red;">City not found: ${cityName}</p>`;
            return;
        }

        const { lat, lon } = geoData[0];

        // Step 2: Weather API
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${tempUnit}`);
        const weatherData = await weatherResponse.json();

        displayWeather(weatherData);
    } catch (error) {
        console.error(error);
        document.getElementById("weatherResult").innerHTML = `<p style="color:red;">Error fetching data</p>`;
    }
}

// Geolocation
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${tempUnit}`);
                    const weatherData = await weatherResponse.json();
                    displayWeather(weatherData);
                } catch (error) {
                    console.error(error);
                    document.getElementById("weatherResult").innerHTML = `<p style="color:red;">Error fetching data</p>`;
                }
            },
            () => {
                alert("Unable to fetch location. Please enter city manually.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Display weather info with icon and dynamic background
function displayWeather(data) {
    const weatherResult = document.getElementById("weatherResult");

    // Weather icon URL
    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Change background based on main weather
    const weatherMain = data.weather[0].main.toLowerCase();
    let bgClass = "default-bg";

    if (weatherMain.includes("cloud")) bgClass = "cloudy-bg";
    else if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) bgClass = "rainy-bg";
    else if (weatherMain.includes("clear")) bgClass = "sunny-bg";
    else if (weatherMain.includes("snow")) bgClass = "snow-bg";
    else bgClass = "default-bg";

    document.body.className = bgClass;

    weatherResult.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="${iconUrl}" alt="${data.weather[0].description}" />
        <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
        <p>🌡 Temperature: ${data.main.temp}°${tempUnit === "metric" ? "C" : "F"}</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>💨 Wind Speed: ${data.wind.speed} m/s</p>
        <button onclick="toggleTempUnit()">Switch to °${tempUnit === "metric" ? "F" : "C"}</button>
    `;
}

// Toggle temperature unit
function toggleTempUnit() {
    tempUnit = tempUnit === "metric" ? "imperial" : "metric";
    getWeatherByCity();
}

// Press Enter to search
document.getElementById("cityInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        getWeatherByCity();
    }
});
