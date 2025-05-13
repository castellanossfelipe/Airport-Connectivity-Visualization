function createTooltip() {
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  /**
   * eventType can be:
   * - a real `MouseEvent` (from mouseover or click)
   * - the string "keyboard" (from arrow or focus navigation)
   */
  window.showTooltip = function(eventOrType, d) {
    let left, top;

    if (eventOrType instanceof MouseEvent) {
      // Normal mouse tooltip positioning
      left = eventOrType.pageX + 12;
      top = eventOrType.pageY - 32;
    } else if (eventOrType === "keyboard") {
      // Fixed location for accessibility navigation
      const tooltipWidth = 250; // Approximate width
      const tooltipHeight = 80; // Approximate height

      left = (window.innerWidth / 2) - (tooltipWidth / 2);
      top = window.innerHeight - tooltipHeight - 30;
    } else {
      // Fallback in case something breaks
      left = window.innerWidth / 2;
      top = window.innerHeight / 2;
    }

    tooltip.transition()
      .duration(100)
      .style("opacity", 0.95);

    tooltip.html(`
      <div><strong>${d["Name"]} (${d["IATA Code"]})</strong></div>
      <div><em>${d["City"]}</em></div>
      <div>✈️ ${d["Destination Count"]} destinations</div>
    `)
      .style("left", `${left}px`)
      .style("top", `${top}px`);
  };

  window.hideTooltip = function() {
    tooltip.transition()
      .duration(100)
      .style("opacity", 0);
  };
}
