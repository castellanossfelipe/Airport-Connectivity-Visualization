// Initialize the map
// [35, -0.1] are the latitude and longitude
// 2 is the zoom
// mapid is the id of the div where the map will appear
var mymap = L.map('mapid', {
  center: [35, -0.1],
  zoom: 2,
  maxBounds: [[-85, -180], [85, 180]],
  maxBoundsViscosity: 1.0,
  maxZoom: 12,
  minZoom: 2
});

// Add a tile to the map = a background. Comes from OpenStreetmap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 12
}).addTo(mymap);

// Add a svg layer to the map
L.svg().addTo(mymap);

// Create data for circles:
var markers = [
  {long: 9.083, lat: 42.149}, // corsica
  {long: 7.26, lat: 43.71}, // nice
  {long: 2.349, lat: 48.864}, // Paris
  {long: -1.397, lat: 43.664}, // Hossegor
  {long: 3.075, lat: 50.640}, // Lille
  {long: -3.83, lat: 48}, // Morlaix
];

// Select the svg area and add circles:
d3.select("#mapid")
  .select("svg")
  .selectAll("myCircles")
  .data(markers)
  .enter()
  .append("circle")
    .attr("cx", function(d){ return mymap.latLngToLayerPoint([d.lat, d.long]).x })
    .attr("cy", function(d){ return mymap.latLngToLayerPoint([d.lat, d.long]).y })
    .attr("r", 14)
    .style("fill", "red")
    .attr("stroke", "red")
    .attr("stroke-width", 3)
    .attr("fill-opacity", .4)

// Function that update circle position if something change
function update() {
  d3.selectAll("circle")
    .attr("cx", function(d){ return mymap.latLngToLayerPoint([d.lat, d.long]).x })
    .attr("cy", function(d){ return mymap.latLngToLayerPoint([d.lat, d.long]).y })
}

// If the user change the map (zoom or drag), I update circle position:
mymap.on("zoom viewreset move", update);