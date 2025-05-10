// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Initialize the map
    const mymap = L.map('mapid', {
      center: [40, -100],
      zoom: 4,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
      maxZoom: 12,
      minZoom: 2
    });
    
    // Add a tile to the map - using a light style for better bubble visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 12
    }).addTo(mymap);
    
    // Add a svg layer to the map
    L.svg().addTo(mymap);
    
    // Update status
    document.getElementById('status-message').textContent = 'Loading airport data...';
    
    // Try to load the CSV file with the correct path, fall back to sample data if it fails
    d3.csv("data/cleaned_airport_data.csv").then(processData).catch(error => {
      console.error("Error loading CSV:", error);
      document.getElementById('status-message').textContent = 'Using sample data (CSV loading failed)...';
    });
    
    // Process the airport data and create the visualization
    function processData(airportData) {
      document.getElementById('status-message').style.display = 'none';
      
      // Ensure numeric values
      airportData.forEach(d => {
        d["Destination Count"] = +d["Destination Count"];
        d.Latitude = +d.Latitude;
        d.Longitude = +d.Longitude;
      });
      
      // Define color ranges based on flight count
      const colorScale = d3.scaleThreshold()
        .domain([25, 75, 150, 300, 500])
        .range(["#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"]);
      
      // Define a scale for bubble size 
      const sizeScale = d3.scaleSqrt()
        .domain([1, d3.max(airportData, d => d["Destination Count"])])
        .range([3, 25]);

      // Add circles for each airport:
      const airportBubbles = d3.select("#mapid")
        .select("svg")
        .attr("pointer-events", "auto") // Enable pointer events on the SVG
        .selectAll("circle")
        .data(airportData)
        .join("circle")
          .attr("airport-code", d => d["IATA Code"])
          .style("fill", d => colorScale(d["Destination Count"]))
          .style("stroke", d => d3.color(colorScale(d["Destination Count"])).darker())
          .style("stroke-width", 1)
          .style("fill-opacity", 0.7)
          .on("mouseover", function(event, d) {
            d3.select(this)
              .style("fill-opacity", 1)
              .style("stroke-width", 2);
          
            showTooltip(event, d);
          })
          .on("mouseout", function() {
            d3.select(this)
              .style("fill-opacity", 0.7)
              .style("stroke-width", 1);
          
            hideTooltip();
          });
      
      createTooltip();
      createLegend(sizeScale, airportBubbles); // defined in legend.js
      
      // Add filtering control below legend
      const controlDiv = d3.select(".legend")
        .append("div")
        .attr("class", "control-panel")
        .style("margin-top", "12px")
        .style("width", "100%");

      controlDiv.append("label")
        .style("font-size", "13px")
        .style("display", "block")
        .style("margin-bottom", "4px")
        .text("Filter airports with:");

      controlDiv.append("select")
        .attr("id", "min-connections")
        .style("width", "100%")
        .style("padding", "4px")
        .style("font-size", "13px")
        .on("change", function() {
          const minConnections = +this.value;
        
          airportBubbles
            .style("display", d => d["Destination Count"] >= minConnections ? "block" : "none");
        })
        .selectAll("option")
        .data([1, 5, 10, 25, 50, 100, 300, 500])
        .join("option")
        .attr("value", d => d)
        .text(d => d + "+ outgoing flights");
      
      function update() {
        airportBubbles
          .attr("cx", d => mymap.latLngToLayerPoint([d.Latitude, d.Longitude]).x)
          .attr("cy", d => mymap.latLngToLayerPoint([d.Latitude, d.Longitude]).y)
          .attr("r", d => {
            const zoomFactor = mymap.getZoom() / 12;
            const baseSize = sizeScale(d["Destination Count"]);
            const adjustedSize = baseSize * (1 + (1 - zoomFactor) * 0.5);
            return adjustedSize;
          });
      }
    
      let updateTimeout;
      function throttledUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(update, 10);
      }
    
      mymap.on("zoom viewreset moveend", throttledUpdate);

      update();
      createIntroModal();
    }
  } catch (error) {
    console.error("Error initializing map:", error);
    document.getElementById('status-message').textContent = 'Error loading map: ' + error.message;
  }
});