// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Initialize the map
    var mymap = L.map('mapid', {
      center: [20, 0], // More central global view
      zoom: 2,
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
    
    // Create a tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    
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
      
      // Create a legend
      const legend = d3.select("body").append("div")
        .attr("class", "legend");
      
      legend.append("h3")
        .text("Outgoing Flights")
        .style("margin", "0 0 10px 0")
        .style("font-size", "16px");
      
      const legendItems = [
        {text: "1-25", color: "#c6dbef"},
        {text: "26-75", color: "#9ecae1"},
        {text: "76-150", color: "#6baed6"},
        {text: "151-300", color: "#4292c6"},
        {text: "301-500", color: "#2171b5"},
        {text: "501+", color: "#084594"}
      ];
      
      // Container to align items vertically
      const legendContainer = legend.append("div")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("gap", "6px")
        .style("align-items", "flex-start");

        let selectedRange = null; // Track currently selected filter

        legendItems.forEach(item => {
          const [minText, maxText] = item.text.includes('+')
            ? [parseInt(item.text), Infinity]
            : item.text.split('-').map(d => parseInt(d));
        
          const minCount = minText || 1;
          const maxCount = maxText || Infinity;
        
          const radius = sizeScale(minCount);
          const diameter = 2 * radius;
        
          const row = legendContainer.append("div")
            .attr("class", "legend-row")
            .style("display", "flex")
            .style("align-items", "center")
            .style("cursor", "pointer")
            .style("padding", "4px 6px")
            .style("border-radius", "4px")
            .on("click", function () {
              // Toggle selection
              const isSame = selectedRange?.[0] === minCount && selectedRange?.[1] === maxCount;
              selectedRange = isSame ? null : [minCount, maxCount];
        
              // Style legend rows based on selection
              legendContainer.selectAll(".legend-row")
                .style("background-color", "transparent");
        
              d3.select(this)
                .style("background-color", isSame ? "transparent" : "#eee");
        
              // Update visible circles
              airportBubbles
                .style("display", d => {
                  const count = d["Destination Count"];
                  if (!selectedRange) return "block";
                  return count >= selectedRange[0] && count <= selectedRange[1] ? "block" : "none";
                });
            });
        
          row.append("div")
            .style("width", `${diameter}px`)
            .style("height", `${diameter}px`)
            .style("background", item.color)
            .style("border-radius", "50%")
            .style("margin-right", "10px")
            .style("border", "1px solid #444")
            .style("flex-shrink", "0");
        
          row.append("span")
            .style("font-size", "13px")
            .text(item.text);
      });
      
      // Add filtering control
      const controlDiv = d3.select("body").append("div")
        .attr("class", "control-panel");
      
      controlDiv.append("label")
        .text("Filter airports with ")
        .append("select")
        .attr("id", "min-connections")
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
              
            tooltip.transition()
              .duration(100)
              .style("opacity", 0.9);
              
            tooltip.html(`<strong>${d["IATA Code"]}</strong><br/>
                        Outgoing Flights: ${d["Destination Count"]}<br/>
                        Location: ${d.Latitude.toFixed(2)}°, ${d.Longitude.toFixed(2)}°`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .style("fill-opacity", 0.7)
              .style("stroke-width", 1);
              
            tooltip.transition()
              .duration(100)
              .style("opacity", 0);
          });
      
      // Function to update circle positions and sizes on map events
      function update() {
        airportBubbles
          .attr("cx", d => mymap.latLngToLayerPoint([d.Latitude, d.Longitude]).x)
          .attr("cy", d => mymap.latLngToLayerPoint([d.Latitude, d.Longitude]).y)
          .attr("r", d => {
            // Dynamically adjust size based on zoom level
            const zoomFactor = mymap.getZoom() / 12; // Normalize by max zoom
            const baseSize = sizeScale(d["Destination Count"]);
            // Slightly increase size at lower zoom levels for visibility
            const adjustedSize = baseSize * (1 + (1 - zoomFactor) * 0.5);
            return adjustedSize;
          });
      }
      
      // When the map is zoomed or moved, update the bubbles
      mymap.on("zoom viewreset moveend", update);
      
      // Initial update
      update();
    }
  } catch (error) {
    console.error("Error initializing map:", error);
    document.getElementById('status-message').textContent = 'Error loading map: ' + error.message;
  }
});