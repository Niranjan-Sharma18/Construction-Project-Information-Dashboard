let map;
let marker;
let currentResources = [];
let currentLat, currentLon;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 54.97, lng: -1.617 },
    zoom: 8
  });
}

$(document).ready(function () {
  $.getJSON("data/projects.json", function (data) {
    data.forEach(project => {
      $("#project").append(`<option value="${project.id}">${project.title}</option>`);
    });

    $("#project").on("change", function () {
      // Check if no valid project is selected
      if (!$(this).val()) {
        // Clear all displayed information
        $("#projectInfo").html("");
        $("#weatherInfo").html("");
        $("#airQuality").html("");
        $("#forecastInfo").html("");
        $("#historyInfo").html("");
        $("#recommendations").html("");

        // Reset the map to its default center and zoom
        map.setCenter({ lat: 54.97, lng: -1.617 });
        map.setZoom(8);

        // Remove any existing marker
        if (marker) {
          marker.setMap(null);
          marker = null;
        }
        return; // Stop further execution
      }

      const selectedId = parseInt($(this).val());
      const project = data.find(p => p.id === selectedId);

      if (project) {
        // Create resource tags for a cleaner display
        const resourceTags = project.resources
          .map(r => `<span class="resource-tag">${r}</span>`)
          .join(" ");
        $("#projectInfo").html(`
          <h2>${project.title}</h2>
          <p>${project.description}</p>
          <p><strong>Resources:</strong> ${resourceTags}</p>
        `);

        const position = { lat: project.latitude, lng: project.longitude };
        currentLat = project.latitude;
        currentLon = project.longitude;

        map.setCenter(position);
        map.setZoom(12);

        if (marker) {
          marker.setMap(null);
        }

        marker = new google.maps.Marker({
          position: position,
          map: map,
          title: project.title
        });

        currentResources = project.resources.map(r => r.toLowerCase());

        fetchWeather(currentLat, currentLon);
        fetchAirQuality(currentLat, currentLon);
        fetchForecast(currentLat, currentLon);

        $("#loadHistory").off("click").on("click", function () {
          const selectedDate = $("#historyDate").val();
          if (selectedDate) {
            fetchHistoricalData(currentLat, currentLon, selectedDate);
          }
        });
      }
    });
  });
});

function fetchWeather(lat, lon) {
  const apiKey = "6f0f26331182e5becf325d75b2063035";
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  $.getJSON(weatherUrl, function (data) {
    const weather = data.weather[0].description;
    const temp = data.main.temp;
    const wind = data.wind.speed;

    $("#weatherInfo").html(`
      <h3>Current Weather</h3>
      <p>Condition: ${weather}</p>
      <p>Temperature: ${temp}°C</p>
      <p>Wind Speed: ${wind} m/s</p>
    `);

    let recs = [];

    if (wind > 8.9 && currentResources.includes("crane")) {
      recs.push("Avoid crane operations due to high wind speed.");
    }

    if (
      weather.includes("heavy") ||
      weather.includes("very heavy") ||
      weather.includes("extreme")
    ) {
      if (currentResources.includes("digger") || currentResources.includes("dumper truck")) {
        recs.push("Rainfall may delay use of diggers and dumper trucks.");
      }
    }

    $("#recommendations").html(
      recs.length > 0 ? recs.join("<br>") : "No weather-related risks."
    );
  });
}

function fetchAirQuality(lat, lon) {
  const apiKey = "6f0f26331182e5becf325d75b2063035";
  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  $.getJSON(aqiUrl, function (data) {
    const aqi = data.list[0].main.aqi;
    const qualityLevels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
    const quality = qualityLevels[aqi];

    $("#airQuality").html(`
      <h3>Air Quality Index</h3>
      <p>Level: ${quality} (AQI: ${aqi})</p>
    `);

    if (aqi >= 3 && currentResources.some(r => r.includes("digger") || r.includes("dumper"))) {
      $("#recommendations").append("<br>Poor air quality — avoid earth-moving activities.");
    } else if (aqi <= 2) {
      $("#recommendations").append("<br>Air quality acceptable for all equipment.");
    }
  }).fail(function () {
    $("#airQuality").html(`<p style="color:red;">Unable to fetch air quality data.</p>`);
  });
}

function fetchForecast(lat, lon) {
  const apiKey = "6f0f26331182e5becf325d75b2063035";
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=8&units=metric&appid=${apiKey}`;

  $.getJSON(forecastUrl, function (data) {
    let html = `
      <h3>8-Day Forecast</h3>
      <table class="forecast-table">
        <tr>
          <th>Date</th>
          <th>Condition</th>
          <th>Temp (°C)</th>
        </tr>
    `;
    data.list.forEach(day => {
      const date = new Date(day.dt * 1000).toLocaleDateString();
      html += `
        <tr>
          <td>${date}</td>
          <td>${day.weather[0].main}</td>
          <td>${day.temp.day}°C</td>
        </tr>
      `;
    });
    html += `</table>`;
    $("#forecastInfo").html(html);
  }).fail(() => {
    $("#forecastInfo").html("<p style='color:red;'>Failed to load forecast.</p>");
  });
}

function fetchHistoricalData(lat, lon, date) {
  const apiKey = "6f0f26331182e5becf325d75b2063035";
  const start = Math.floor(new Date(date + "T00:00:00").getTime() / 1000);
  const end = Math.floor(new Date(date + "T23:59:59").getTime() / 1000);
  const histUrl = `https://history.openweathermap.org/data/2.5/history/city?lat=${lat}&lon=${lon}&type=hour&start=${start}&end=${end}&appid=${apiKey}&units=metric`;

  // Convert yyyy-mm-dd -> dd/mm/yyyy for UK format
  let ukDate = date;
  if (date.includes("-")) {
    const [year, month, day] = date.split("-");
    ukDate = `${day}/${month}/${year}`;
  }

  $.getJSON(histUrl, function (data) {
    if (!data.list || data.list.length === 0) {
      $("#historyInfo").html(`<p>No historical data found for ${ukDate}.</p>`);
      return;
    }

    let avgTemp = 0;
    data.list.forEach(d => {
      avgTemp += d.main.temp;
    });
    avgTemp = (avgTemp / data.list.length).toFixed(2);

    const condition = data.list[0].weather[0].description;

    $("#historyInfo").html(`
      <h3>Historical Data (${ukDate})</h3>
      <p>Weather: ${condition}</p>
      <p>Average Temp: ${avgTemp}°C</p>
    `);
  }).fail(() => {
    $("#historyInfo").html(`<p style="color:red;">Failed to load historical data.</p>`);
  });
}
