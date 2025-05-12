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
      
      // Sort geographically (left to right, top to bottom)
      airportData = airportData.sort((a, b) => {
        // First by latitude (north to south)
        const latDiff = b.Latitude - a.Latitude; // Higher latitude first (north to south)
        if (Math.abs(latDiff) > 1) {
          return latDiff;
        }
        // Then by longitude (west to east)
        return a.Longitude - b.Longitude;
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
        .attr("role", "img")
        .attr("aria-label", `Interactive map showing ${airportData.length} airports with connectivity data. Use arrow keys to navigate between airports.`)
        .selectAll("circle")
        .data(airportData)
        .join("circle")
          .attr("airport-code", d => d["IATA Code"])
          .attr("role", "button")
          .attr("aria-label", d => 
            `${d["Name"]} airport in ${d["City"]}, ${d["IATA Code"]}, ${d["Destination Count"]} destinations`
          )
          .attr("tabindex", "-1") // NO airports in tab order
          .style("fill", d => colorScale(d["Destination Count"]))
          .style("stroke", d => d3.color(colorScale(d["Destination Count"])).darker())
          .style("stroke-width", 1)
          .style("fill-opacity", 0.7)
          .style("outline", "none")
          .style("cursor", "pointer")
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
          })
          .on("focus", function(event, d) {
            d3.select(this)
              .style("fill-opacity", 1)
              .style("stroke-width", 3)
              .style("filter", "drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))");
            
            showTooltip(event, d);
          })
          .on("blur", function() {
            d3.select(this)
              .style("fill-opacity", 0.7)
              .style("stroke-width", 1)
              .style("filter", "none");
          
            hideTooltip();
          })
          .on("keydown", function(event, d) {
            const currentAirport = d3.select(this);
            
            switch(event.key) {
              case 'Enter':
              case ' ':
                event.preventDefault();
                showTooltip(event, d);
                break;
                
              case 'Escape':
                // Escape brings you back to the legend
                event.preventDefault();
                event.stopPropagation();
                d3.select(this).node().blur(); // Remove focus from airport
                const jumpButton = document.querySelector('#jump-to-airport-btn');
                if (jumpButton) {
                  jumpButton.focus();
                }
                break;
                
              case 'Home':
                // Home key takes you to the first visible airport
                event.preventDefault();
                const firstVisibleAirport = airportBubbles
                  .filter(function() {
                    return d3.select(this).style("display") !== "none";
                  })
                  .nodes()[0];
                if (firstVisibleAirport) {
                  firstVisibleAirport.focus();
                }
                break;
                
              case 'End':
                // End key takes you to the last visible airport
                event.preventDefault();
                const allVisibleAirports = airportBubbles
                  .filter(function() {
                    return d3.select(this).style("display") !== "none";
                  })
                  .nodes();
                if (allVisibleAirports.length > 0) {
                  allVisibleAirports[allVisibleAirports.length - 1].focus();
                }
                break;
                
              case 'ArrowUp':
              case 'ArrowDown':
              case 'ArrowLeft':
              case 'ArrowRight':
                // Arrow keys for spatial navigation
                event.preventDefault();
                navigateAirportsSpatially(event, currentAirport, airportBubbles);
                break;
            }
          });
      
      createTooltip();
      createLegend(sizeScale, airportBubbles);
      
      // Add simplified airport navigation
      const navigationDiv = d3.select(".legend")
        .append("div")
        .attr("class", "airport-navigation")
        .style("margin-top", "20px")
        .style("padding-top", "15px")
        .style("border-top", "1px solid rgba(255, 255, 255, 0.2)")
        .style("width", "100%");

      navigationDiv.append("h3")
        .style("font-size", "14px")
        .style("margin", "0 0 8px 0")
        .style("color", "#fff")
        .text("Explore Airports");

      navigationDiv.append("p")
        .style("font-size", "11px")
        .style("color", "#ccc")
        .style("margin", "0 0 10px 0")
        .style("line-height", "1.3")
        .text("Airports sorted geographically. Use button below to start exploring with arrow keys.");

      // Single button to jump to first airport and start arrow navigation
      const jumpButton = navigationDiv.append("button")
        .attr("id", "jump-to-airport-btn")
        .attr("tabindex", "0")
        .style("padding", "8px 12px")
        .style("background", "#2171b5")
        .style("color", "#fff")
        .style("border", "none")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("cursor", "pointer")
        .style("width", "100%")
        .text("Start Exploring Airports (Arrow Keys)")
        .on("click", function() {
          // Find first visible airport and focus it
          const firstVisibleAirport = airportBubbles
            .filter(function() {
              return d3.select(this).style("display") !== "none";
            })
            .node();
          
          if (firstVisibleAirport) {
            firstVisibleAirport.focus();
          }
        });

      // Add keyboard hint
      navigationDiv.append("div")
        .style("font-size", "10px")
        .style("color", "#aaa")
        .style("margin-top", "8px")
        .style("line-height", "1.3")
        .html("Once exploring: <br>• Arrows = Navigate • Enter/Space = Info<br>• Escape = Return here • Home/End = First/Last");
      
      // Add filtering control below navigation
      const controlDiv = d3.select(".legend")
        .append("div")
        .attr("class", "control-panel")
        .style("margin-top", "15px")
        .style("padding-top", "15px")
        .style("border-top", "1px solid rgba(255, 255, 255, 0.2)")
        .style("width", "100%");

        controlDiv.append("label")
        .attr("for", "min-connections")
        .style("font-size", "13px")
        .style("display", "block")
        .style("margin-bottom", "4px")
        .text("Filter airports with:");
      
      controlDiv.append("select")
        .attr("id", "min-connections")
        .attr("aria-label", "Minimum number of destinations to display")      
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
        .text(d => d + "+ destinations");
      
      // Function for spatial navigation between airports
      function navigateAirportsSpatially(event, currentAirport, airportBubbles) {
        const currentNode = currentAirport.node();
        const currentBounds = currentNode.getBoundingClientRect();
        const currentX = currentBounds.left + currentBounds.width / 2;
        const currentY = currentBounds.top + currentBounds.height / 2;
        
        const direction = event.key;
        let bestMatch = null;
        let bestDistance = Infinity;
        
        airportBubbles.each(function(d) {
          const node = d3.select(this);
          if (node.style("display") === "none" || this === currentNode) {
            return;
          }
          
          const bounds = this.getBoundingClientRect();
          const x = bounds.left + bounds.width / 2;
          const y = bounds.top + bounds.height / 2;
          
          let isValidDirection = false;
          let distance = 0;
          
          switch(direction) {
            case 'ArrowUp':
              isValidDirection = y < currentY - 10;
              distance = Math.abs(currentX - x) + Math.abs(currentY - y);
              break;
            case 'ArrowDown':
              isValidDirection = y > currentY + 10;
              distance = Math.abs(currentX - x) + Math.abs(currentY - y);
              break;
            case 'ArrowLeft':
              isValidDirection = x < currentX - 10;
              distance = Math.abs(currentX - x) + Math.abs(currentY - y);
              break;
            case 'ArrowRight':
              isValidDirection = x > currentX + 10;
              distance = Math.abs(currentX - x) + Math.abs(currentY - y);
              break;
          }
          
          if (isValidDirection && distance < bestDistance) {
            bestDistance = distance;
            bestMatch = this;
          }
        });
        
        if (bestMatch) {
          bestMatch.focus();
        }
      }
      
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
      document.getElementById('show-intro-btn').addEventListener('click', createIntroModal);
    }
  } catch (error) {
    console.error("Error initializing map:", error);
    document.getElementById('status-message').textContent = 'Error loading map: ' + error.message;
  }
  
});