function createLegend(sizeScale, airportBubbles) {
  const legend = d3.select("body").append("div")
  .attr("class", "legend");

  legend.append("h2")
  .text("Number of Destinations")
  .style("margin", "0 0 10px 0")
  .style("font-size", "16px");

  legend.append("p")
      .text("Click a bubble group to filter by size.")
      .style("margin", "0 0 12px 0")
      .style("font-size", "12px")
      .style("color", "#ccc")
      .style("line-height", "1.4");

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

  let selectedRange = null;

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
      .attr("tabindex", "0")
      .attr("role", "button")
      .attr("aria-label", `Filter airports with ${item.text} destinations`)
      .attr("aria-pressed", "false")
      .style("display", "flex")
      .style("align-items", "center")
      .style("cursor", "pointer")
      .style("padding", "4px 6px")
      .style("border-radius", "4px")
      .style("outline", "none")
      .style("transition", "background-color 0.2s, box-shadow 0.2s")
      .on("click", handleRowSelect)
      .on("keydown", function(event) {
          if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleRowSelect.call(this);
          }
      })
      .on("focus", function() {
          d3.select(this).style("box-shadow", "0 0 0 2px #2171b5");
      })
      .on("blur", function() {
          d3.select(this).style("box-shadow", "none");
      });

  function handleRowSelect() {
      const isSame = selectedRange?.[0] === minCount && selectedRange?.[1] === maxCount;
      selectedRange = isSame ? null : [minCount, maxCount];
    
      // Update all legend rows
      legendContainer.selectAll(".legend-row")
        .style("background-color", "transparent")
        .attr("aria-pressed", "false");
    
      // Update current row
      d3.select(this)
        .style("background-color", isSame ? "transparent" : "rgba(255, 255, 255, 0.15)")
        .attr("aria-pressed", isSame ? "false" : "true");
    
      // Filter airport bubbles
      airportBubbles
        .style("display", d => {
          const count = d["Destination Count"];
          if (!selectedRange) return "block";
          return count >= selectedRange[0] && count <= selectedRange[1] ? "block" : "none";
        });
    
      // Disable and reset dropdown when filtering via legend
      const dropdown = d3.select("#min-connections");
      if (selectedRange) {
          dropdown.property("selectedIndex", 0)
                .attr("disabled", true);
      } else {
        dropdown.attr("disabled", null);
      }
  }          

  row.append("div")
      .style("width", `${diameter}px`)
      .style("height", `${diameter}px`)
      .style("background", item.color)
      .style("border-radius", "50%")
      .style("margin-right", "10px")
      .style("border", "1px solid #444")
      .style("flex-shrink", "0")
      .style("border", item.color === "#c6dbef" ? "1px solid #aaa" : "1px solid #444");

  row.append("span")
      .style("font-size", "13px")
      .text(item.text);
  })
};