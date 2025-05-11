function createTooltip() {
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    window.showTooltip = function(event, d) {
      tooltip.transition()
        .duration(100)
        .style("opacity", 0.95);
  
      tooltip.html(`
        <div><strong>${d["Name"]} (${d["IATA Code"]})</strong></div>
        <div><em>${d["City"]}</em></div>
        <div>✈️ ${d["Destination Count"]} destinations</div>
      `)
      .style("left", (event.pageX + 12) + "px")
      .style("top", (event.pageY - 32) + "px");
    };
  
    window.hideTooltip = function() {
      tooltip.transition()
        .duration(100)
        .style("opacity", 0);
    };
  }
  