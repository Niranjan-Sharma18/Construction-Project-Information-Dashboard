# Construction Project Information Dashboard

A cloud-hosted web dashboard for visualizing real-time and forecasted weather, air quality, and resource data for active construction sites across the UK. Designed for project managers to assess weather-related risks and sustainability impacts for equipment-intensive construction tasks.

**Live Demo:** [constructiondash.westus2.cloudapp.azure.com](https://constructiondash.westus2.cloudapp.azure.com/)

---

## Features

- **Project Selector** – Choose from multiple construction sites (e.g., NESST)
- **Project Info Panel** – Displays title, description, and key resources (e.g., cranes, drills, dumpers)
- **Google Maps Integration** – Shows live location of the selected project
- **Real-Time Weather** – Displays current weather, temperature, and wind speed via OpenWeather API
- **Air Quality Data** – Indicates current air quality and work recommendations (based on AQI)
- **8-Day Forecast** – Visual forecast table of temperature and conditions
- **Historical Weather** – Retrieve past weather data for informed project planning
- **Risk Alerts** – Automated recommendations based on:
  - Wind speed vs crane usage
  - Rain intensity vs earth-moving equipment
  - AQI levels vs environmental sustainability

---

## Technologies Used

- **Frontend**: HTML, CSS, Bootstrap, JavaScript, jQuery
- **Backend**: PHP
- **APIs**:
  - OpenWeatherMap (Weather + Air Pollution)
  - Google Maps API
- **Database**: Static JSOn file.
- **Cloud Hosting**: Azure Virtual Machine (Ubuntu)
- **Security**: RBAC (root, admin, web admin users), secure API key usage
- **IaC Folder**: Contains infrastructure provisioning scripts/configs

---

## Project Structure

```
Construction Project_WebApp/
├── css/                # Custom stylesheets
├── js/                 # JavaScript + jQuery logic
├── index.html          # Main UI layout
├── README.md           # This file
├── IaC/                # Infrastructure-as-Code folder
```

---

## Security & Sustainability

- RBAC implemented for three roles:
  - `kv-root` – Full access at subscription level
  - `kv-admin` – Resource group contributor
  - `kv-web-admin` – Linux user for web content editing
- Minimalist and accessible design
- No unnecessary scripts or CSS libraries to reduce carbon footprint

---

## Usage Instructions

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/construction-project-dashboard.git
   ```
2. Upload to your Azure VM in `/var/www/html/`
3. Add your API keys to the relevant config files
4. Open the browser and visit: `http://your-vm-ip`

---

## Demo & Assessment Info

This project was developed for **KV6012 Cloud Computing** at Northumbria University. It includes:

- Cloud architecture with secure VM setup
- Live web dashboard hosted on Azure
- API integrations and risk logic
- Infrastructure-as-Code (IaC) scripts

### Data Source

The project uses a static file `projects.json` as a mock database to simulate real-world construction project data. Each entry includes:

- **Project ID, Title, and Description**
- **Latitude & Longitude** (used for Google Maps marker)
- **Resources** like cranes, diggers, and dumpers, used to determine risk based on weather/air quality.

```
projects.json
├── id: Unique project ID
├── title: Name of the construction project
├── description: Brief overview
├── latitude / longitude: Coordinates for map marker
└── resources: Array of equipment used on the site
```

The app dynamically reads this file to populate the UI with project-specific data and drive weather/AQI logic.
