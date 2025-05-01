# Airport-Connectivity-Visualization
Interactive world map showing airport connectivity using OpenFlights data and D3.js.
# Where Can You Go? A World Map of Airport Connectivity (2024)

**By Charlie Ratliff & Felipe Castellanos**  
Visualizing airports, airlines, planes, and commercial routes using data from [OpenFlights.org](https://openflights.org/).

## Overview

This project uses proportional symbol mapping to visualize global airport connectivity. Each airport is represented by a bubble whose size reflects the number of outgoing routes, making it easy to identify major air travel hubs across continents.

## Dataset

We use a [Kaggle compilation of OpenFlights’ dataset](https://www.kaggle.com/datasets/ahmadrafiee/airports-airlines-planes-and-routes-update-2024?resource=download&select=airports.csv) containing over 10,000 data points across four CSVs:

- **`airlines.csv`** — Airline identifiers and info  
- **`airports.csv`** — Coordinates and metadata of each airport  
- **`airplanes.csv`** — Aircraft metadata (not central to this vis)  
- **`routes.csv`** — Origin-destination routes for commercial airlines  

_No data cleaning needed; data is already in usable form._

## Visualization Description

### Title:  
**Where Can You Go? A World Map of Airport Connectivity (2024)**

### Visualization Features

- **Proportional Symbol Map:** Bubble size corresponds to the number of outgoing routes.
- **Interactive Tooltips:** Show airport name, IATA code, and route count on hover.
- **Color Scale:** Accessible and colorblind-friendly color schemes from [ColorBrewer2](https://colorbrewer2.org/).
- **Grayscale Mode:** Optional for visual accessibility.
- **Responsive Layout & Readable Labels:** Works on various screen sizes.

## Tech Stack

- **D3.js v7**
- **TopoJSON or GeoJSON** for rendering world map
- **HTML/CSS/JS** — Simple static frontend

## Running the Project

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/airport-connectivity-map.git
   cd airport-connectivity-map
   ```

2. Start a local server (Python example):
   ```bash
   python -m http.server
   ```

3. Open `index.html` in your browser.

## License

MIT License
